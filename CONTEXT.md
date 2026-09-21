# Contexto de Desarrollo - Proyecto "Invited"

Este archivo mantiene el contexto del proyecto para retomar de inmediato en las siguientes sesiones de trabajo.

## Estado Actual del Proyecto (Última actualización: 20 de Septiembre, 2026)
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

## Avances Completados en la Sesión (20 de Septiembre, 2026)

### 1. Integración Completa de Elementos 3D (.glb, .gltf, .fbx, .dae, .obj)
- **Backend Laravel (`AssetController.php`):**
  - Subida de archivos 3D habilitada con extensiones `.glb, .gltf, .fbx, .dae, .obj`.
  - Límite de subida de recursos ampliado a 50 MB (`max:51200`).
  - Categorización automática de tipo `'3d'`.
- **Banco de Recursos (`AssetPickerPopover.tsx`):**
  - Añadida la pestaña de tipo **3D** con filtros de búsqueda y selector de modelos 3D.
- **Renderizado WebGL de Alto Rendimiento (`DesignerMediaElements.tsx`):**
  - Implementación del componente `<ThreeDElementItem />` basado en Google `<model-viewer>`.
  - Soporte para rotación automática 360°, animaciones nativas en bucle, sombras personalizadas e iluminación WebGL con fondo transparente.
  - **Rotación 3D Interactiva con `Ctrl`:** Al presionar la tecla `Ctrl` y arrastrar sobre el modelo 3D con el ratón/pantalla táctil, el usuario puede rotar libremente el objeto 3D en los ejes $X$, $Y$ y $Z$.
  - **Efecto Parallax 3D:** Conectado al giroscopio del teléfono (`deviceorientation`) y al movimiento del ratón en escritorio para rotar suavemente el objeto 3D según la orientación.
- **Panel Inspector & Lienzo (`InvitationDesigner.tsx` y `InvitationViewer.tsx`):**
  - Añadida la sección de **Orientación & Rotación 3D ($X, Y, Z$)** y **Escala 3D ($X, Y, Z$)** dentro del acordeón *Posición & Tamaño*.
  - Controles para Autoplay de animaciones nativas, Auto-rotate 360° e intensidad de sombra.
  - Renderizado idéntico y fluido en el visor de invitados (`InvitationViewer.tsx`).

### 2. Optimización de Miniaturas y Almacenamiento JSON
- **Backend (`InvitationController.php`):**
  - Resuelto error 500 en MySQL mediante guardado de imágenes preview en disco público (`storage/app/public/invitations/previews/preview_{id}.jpg`), almacenando URLs limpias en el JSON.
- **Frontend (`InvitationDesigner.tsx`):**
  - Captura optimizada con `html2canvas` reduciendo peso de preview de Megabytes a ~15 KB.

### 3. Ajustes de UI, Scrollbars y Frosted Glass
- **Diseñador de Invitaciones (`InvitationDesigner.tsx`):**
  - Corregidos problemas de desplazamiento flexbox e `overflow-auto` para centrar el lienzo cuando es pequeño y permitir desplazamiento desde (0,0) al aumentar el zoom.
  - Personalizadas todas las barras de scroll y controles de vidrio esmerilado con la paleta de color del proyecto (`var(--primary-accent)` / `#E07A5F`).

---

## Pendientes para Continuar Mañana:
1. **Animaciones de Entrada de Elementos Individuales en el Visor:**
   - Probar y sincronizar animaciones individuales de cada elemento (`fadeIn`, `slideInUp`, `zoomIn`) al cambiar de escena.
2. **Interactividad Real de Botones & Modales:**
   - Programar apertura real del modal RSVP, integración con mapas Leaflet/Google, y mesa de regalos.
3. **Protocolo y Tótem de Recepción (Fases siguientes):**
   - Pantalla de check-in en puerta y kiosco interactivo para el día del evento.

---

## Notas para el Desarrollador (Agente de IA)
1. Para levantar el proyecto localmente usar `npm run dev`.
2. No ejecutar comandos `git commit` o `git push` sin autorización explícita del usuario.
3. Al interactuar con el lienzo en el diseñador, la tecla `Ctrl` habilita los controles interactivos de rotación 3D sobre el objeto sin desordenar la selección general de capas.

---

## Estado de Git y GitHub
- **Rama activa:** `main`
- **Último Commit:** `feat: integrar elementos 3D con animaciones nativas, rotaciones X/Y/Z, parallax giroscopio y controles interactivos`
- **Estado de sincronización:** Repositorio local e `origin/main` en GitHub completamente al día.
