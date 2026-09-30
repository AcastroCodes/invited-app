# Contexto de Desarrollo - Proyecto "Invited"

Este archivo mantiene el contexto del proyecto para retomar de inmediato en las siguientes sesiones de trabajo.

## Estado Actual del Proyecto (Última actualización: 27 de Septiembre, 2026)
- **Stack:** Laravel 12 (API), React 19 (SPA), Vite, TailwindCSS v4, HTML2Canvas, Google `<model-viewer>` WebGL.
- **Autenticación:** Implementada con Laravel Sanctum (Cookies Stateful) con el hook `useAuth.tsx`.
- **Rutas Principales (`app.jsx`):**
  - `/` -> Landing Page con globo 3D.
  - `/login` -> Inicio de sesión.
  - `/dashboard` -> Estadísticas e indicadores.
  - `/events` -> Listado de eventos.
  - `/events/:id/config` -> Pantalla unificada de servicios del evento (Invitados, Invitación, Protocolo, Tótem).
  - `/events/:id/invitations/:invitationId/designer` -> Diseñador de Invitaciones Interactivas 2D/3D (Clon estilo Canva/Jitter).
  - `/v/:id` -> **Visor Público de la Invitación (Player final para los invitados)**.

---

## Avances Completados en la Sesión (27 de Septiembre, 2026)

### 1. Sistema de Alineación Horizontal y Vertical para Elementos de Texto (`TextElementItem.tsx`)
- **Iconografía Unificada de Alineación:**
  - Alineación Horizontal: Izquierda, Centro, Derecha (usando íconos de la sección Posición & Tamaño).
  - Alineación Vertical: Arriba, Centro, Abajo (usando íconos de la sección Posición & Tamaño con tamaño reducido de botones para mejor UX).
- **Flexbox Interno en Lienzo:**
  - Implementado alineado vertical perfecto (`flex flex-col justify-start / justify-center / justify-end`) para que el texto respete la caja delimitadora de forma precisa tanto en el diseñador como en el visor público.

### 2. Bloqueo de Edición de Texto en Widgets (Candado Inteligente)
- **Control de Bloqueo (`lockedInWidget`):**
  - Añadido botón de candado en la columna lateral izquierda del contenido de texto (`TextElementItem.tsx` e `InvitationDesigner.tsx`).
  - Estado desbloqueado (candado normal/gris): El campo de texto dentro de un widget puede ser editado libremente.
  - Estado bloqueado (candado en rojo): El campo queda protegido cuando forma parte de un widget para evitar alteraciones accidentales.

### 3. Modo Único "Texto Estático" vs "Base de Datos" y Popover de Variables
- **Interruptor Unificado de Modo:**
  - Botón de alternancia rápida entre **Modo Texto Estático** (ícono de tipo de letra) y **Modo Base de Datos** (ícono de base de datos).
  - Al activar el **Modo Base de Datos**, el campo habilita la inserción de variables dinámicas encerradas en corchetes `[...]`.
- **Inspector Inteligente de Variables (`Smart Variable Inspector`):**
  - Al presionar `[` o escribir en Modo Base de Datos, se despliega un popover contextual.
  - Recomienda automáticamente variables relevantes según el tipo de widget seleccionado (ej. *Cuenta Regresiva* recomienda `[dias_restantes]`, `[horas_restantes]`, `[minutos_restantes]`, `[segundos_restantes]`).
  - También incluye sugerencias universales como `[nombre_invitado]`, `[pases]`, `[mesa]`, `[fecha_evento]`, `[lugar_evento]`, etc.

### 4. Normalización de Previsualización en Lienzo (Valores Puros para Cuenta Regresiva)
- **Previsualización de Variables Dinámicas (`DB_PREVIEW_VALUES`):**
  - Ajustados los valores de previsualización para mostrar únicamente el valor numérico limpio en el lienzo sin sufijos de texto:
    - `[dias_restantes]` ➔ `05`
    - `[horas_restantes]` ➔ `12`
    - `[minutos_restantes]` ➔ `30`
    - `[segundos_restantes]` ➔ `45`
  - Esto permite al usuario maquetar y diseñar libremente etiquetas o sufijos personalizados alrededor de los números del temporizador.

---

## Avances Anteriores (20 - 23 de Septiembre, 2026)

### 1. Integración Completa de Elementos 3D (.glb, .gltf, .fbx, .dae, .obj)
- **Backend Laravel & Banco de Recursos:** Subida de modelos 3D hasta 50MB y pestaña 3D en `AssetPickerPopover.tsx`.
- **Renderizado WebGL (`<model-viewer>`):** Rotación 360°, sombras, animación native, efecto Parallax 3D por giroscopio/mouse y rotación interactiva 3D presionado `Ctrl`.

### 2. Recorte de Video (Trim) y Editor Profesional FFmpeg WebAssembly
- Processing client-side con `@ffmpeg/ffmpeg` para recortes rápidos y 7 modos de reproducción unificados (`seamless`, `pingpong`, `rewind`, `slowmo`, `reverse`, `stutter`, `once`).
- Exclusión de librerías en `vite.config.js` y subida directa de blobs al backend.

### 3. Optimización de Miniaturas y Accessors Laravel
- Captura de previews con `html2canvas` guardadas en `storage/app/public/invitations/previews/` e integración de accessors `logo_url`, `background_url` y `avatar_url` en los modelos de Laravel.

---

## Pendientes para Continuar:
1. **Animaciones de Entrada de Elementos Individuales en el Visor:**
   - Probar y sincronizar animaciones individuales de cada elemento (`fadeIn`, `slideInUp`, `zoomIn`) al cambiar de escena.
2. **Interactividad Real de Botones & Modales:**
   - Programar apertura real del modal RSVP, integración con mapas Leaflet/Google, y mesa de regalos.
3. **Sincronización Dinámica Real de Variables en el Visor (`InvitationViewer.tsx`):**
   - Conectar la resolución de variables en tiempo real con los datos del invitado al cargar la URL pública `/v/:id`.
4. **Protocolo y Tótem de Recepción (Fases siguientes):**
   - Pantalla de check-in en puerta y kiosco interactivo para el día del evento.

---

## Notas para el Desarrollador (Agente de IA)
1. Para levantar el proyecto localmente usar `npm run dev`.
2. No ejecutar comandos `git commit` o `git push` sin autorización explícita del usuario.
3. Al interactuar con el lienzo en el diseñador, la tecla `Ctrl` habilita los controles interactivos de rotación 3D sobre el objeto sin desordenar la selección general de capas.

---

## Mapa de Widgets y Variables de Base de Datos
A continuación se documentan los tipos de widgets soportados por el Diseñador de Invitaciones y cómo sus variables dinámicas conectan con los Modelos de Laravel:

### 1. Widget de Cuenta Regresiva (Countdown)
Conecta con el modelo `Event` (`events -> event_date`):
- `[dias_restantes]`, `[horas_restantes]`, `[minutos_restantes]`, `[segundos_restantes]`: Calculados dinámicamente comparando `event_date` con el momento actual.
- `[fecha_evento]`: Extrae la porción de fecha de `event_date`.
- `[hora_evento]`: Extrae la porción de tiempo de `event_date`.

### 2. Widget RSVP (Confirmación de Asistencia)
Conecta con los modelos `Guest` y `GuestGroup`:
- `[nombre_invitado]`: Desde `guests -> name` o `guest_groups -> formal_addressee`.
- `[pases_asignados]`: Desde `guest_groups -> max_guests` o `guests -> companion_count`.
- `[confirmacion_status]`: Desde `guests -> is_confirmed` (Booleano) o `guests -> status`.
- `[adultos_confirmados]` y `[ninos_confirmados]`: Se calcula sumando `is_confirmed = true` y filtrando por `category` en la tabla `guests`.

### 3. Widget de Mapa / Ubicación
Conecta con el modelo `Event`:
- `[lugar_evento]` y `[direccion_evento]`: Extraído de `events -> location`.
- `[mapa_url]`: Generado con las columnas `events -> latitude` y `events -> longitude`.

### 4. Widget de Mesa de Regalos (Gift)
Conecta con el campo JSON del modelo `Event`:
- `[banco_nombre]`, `[clabe_interbancaria]`, `[titular_cuenta]`, `[tienda_regalos_url]`: Extraídos desde el arreglo/JSON `services` en `events`.

### 5. Datos Generales (Eventos, Mesas y Accesos)
- `[nombre_evento]`: Desde `events -> name`.
- `[mesa]`: Desde el modelo `Table` (`tables -> name`), vinculado a través de `guests -> table_id`.
- `[anfitriones]`: Asociado a la relación con el `Partner` o configuraciones extra.
- `[codigo_qr]`: Renderizado al vuelo mediante el ID o Token único de acceso del invitado.

*Nota:* El "Itinerario" existe nativamente en el modelo `Event` (`events -> itinerary` tipo JSON), pero requiere desarrollo de su Widget visual correspondiente (Timeline) para el Diseñador.

---

## Estado de Git y GitHub
- **Rama activa:** `main`
- **Último Commit:** `feat: integrar elementos 3D con animaciones nativas, rotaciones X/Y/Z, parallax giroscopio y controles interactivos`
- **Estado de sincronización:** Repositorio local e `origin/main` en GitHub completamente al día.
