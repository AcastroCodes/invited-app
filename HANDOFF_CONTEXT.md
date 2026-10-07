# Resumen de Contexto y Estado del Proyecto (Módulo App Móvil)

**Fecha de Actualización:** 05 de Octubre de 2026  
**Proyecto:** dInvited (Módulo PhotoManager & MobileSimulator)

---

## 1. Resumen del Trabajo Realizado

En esta sesión se desarrolló y perfeccionó la interfaz de **Configuración de App Móvil** dentro de `PhotoManager.tsx` y su previsualización en tiempo real en `MobileSimulator.tsx`.

### 1.1 Estructura de Navegación y Pestañas
- **Pestaña Bienvenida - Sub-pestañas principales:**
  1. **Precarga** (Pantalla Splash de inicio de la app).
  2. **Bienvenida** (Pantalla de bienvenida con título, mensaje y botón).
  3. **Verificación GPS** (Configuración de geofencing/radio de ubicación para invitados).
  4. **Registro** (Campos de registro y datos requeridos).

- **Sub-pestañas dentro de Precarga:**
  - **Fuente** (Tipografía y textos).
  - **Contenedor** (Fondos y recuadro central).
  - **Logos** (Logos de evento y marca/proyecto).

---

### 1.2 Módulo de Fuentes y Textos de Bienvenida (`bienvenidaSubTab === 'fuentes'`)
- **Tarjeta Superior (Fuentes y Textos de Bienvenida):**
  - **Pestañas de Selección:** Alterna entre **Título** (`welcome_title`) y **Contenido** (`welcome_subtitle`).
  - **Controles Disponibles:** Texto personalizado, `FontPicker` con catálogo Google Fonts, tamaño `px` stepper (`+`/`-`), formato (*Bold*, *Italic*, *Underline*), y selector de estilos (`StylePickerPopover`) con color de relleno, borde (*stroke*) y sombra (*shadow*).
- **Tarjeta Inferior (Fuente y Estilo de Botón):**
  - **Pestañas de Estado:** Alterna entre estado **Normal** y **Sobre** (`hover`).
  - **Controles Disponibles:** Campo de texto del botón (`welcome_button_text`), `FontPicker`, tamaño `px`, formato (*Bold*, *Italic*, *Underline*), alineación (*Izq*, *Centro*, *Der*, *Justificado*) y selector de estilos completo (`StylePickerPopover`) idéntico a *General -> Botones*.

---

### 1.3 Módulo de Contenedor y Fondo de Precarga
- **Estructura idéntica a General -> Contenedores (Fondo):**
  - Pestañas derechas para alternar entre **Fondo** (Pantalla completa) y **Mensaje** (Recuadro central de carga).
- **Subida de Archivos Multimedios:**
  - Soporta imágenes (`PNG`, `JPG`) y videos (`MP4`, `WEBM`).
  - Casilla de verificación **"Rotar Video"** (rotación 90° en la pantalla móvil).
  - Área drag & drop con vista previa y botones para cambiar o eliminar archivo.
- **Estilos y Formato:**
  - **Estilo (`StylePickerPopover`):** Selección de color sólido, degradados (*gradients*), grosores, tipos y colores de borde, además de sombreados (`shadowBlur`, `shadowOffsetX`, `shadowOffsetY`).
  - **Redondez (`px`):** Control numérico stepper con botones `-` y `+`.
  - **Efecto Cristal (`Glassmorphism`):** Toggle de desenfoque (*backdrop-blur*) y slider de opacidad (`0-100%`).

---

### 1.4 Módulo de Logos en Precarga
- **Estructura de 2 Columnas idéntica a General -> Logos:**
  - **Columna 1: Logo del Evento (Precarga)**:
    - Botón de visibilidad (*Visible / Oculto en Precarga*).
    - Vista previa del logo.
    - Alineación Vertical (*Arriba*, *Centro*, *Abajo*).
    - Alineación Horizontal (*Izquierda*, *Centro*, *Derecha*).
    - Tamaño / Ancho Máximo con unidades (`px` / `%`).
    - Márgenes independientes (*Arriba*, *Abajo*, *Izquierda*, *Derecha*) con unidades (`px` / `%`).
  - **Columna 2: Logo Powered By / Proyecto (dinvited.png)**:
    - Botón de visibilidad (*Visible / Oculto en Precarga*).
    - Vista previa de `/dinvited.png`.
    - Alineación Vertical (*Arriba*, *Centro*, *Abajo*).
    - Alineación Horizontal (*Izquierda*, *Centro*, *Derecha*).
    - Tamaño / Ancho Máximo con unidades (`px` / `%`).
    - Márgenes independientes (*Arriba*, *Abajo*, *Izquierda*, *Derecha*) con unidades (`px` / `%`).

---

### 1.5 Previsualizador Móvil (`MobileSimulator.tsx`)
- **Ajustes de Proporción:** Se incrementó la altura a `570px` (aspect ratio 19.5:9) para un aspecto de smartphone moderno.
- **Navegación:** Se removió el botón de Precarga de los controles exteriores flotantes mientras se mantiene la sincronización automática al hacer clic en la sub-pestaña de Precarga.
- **Renderizado Dinámico:** Renderiza en tiempo real tipografías, colores, glassmorphism, degradados, opacidades y posiciones de logos.

---

### 1.6 Módulo de Logos en Bienvenida (`bienvenidaSubTab === 'logos'`)
- **Estructura de 2 Tarjetas / Columnas Completa:**
  - **Logo del Evento (Bienvenida):**
    - Botón de visibilidad (*Visible / Oculto en Bienvenida*).
    - Vista previa del logo.
    - Alineación Vertical (*Arriba*, *Centro*, *Abajo*) con prevención de colisiones.
    - Alineación Horizontal (*Izq*, *Centro*, *Der*) con prevención de colisiones.
    - Tamaño / Ancho Máximo con selección de unidades (`px` / `%`).
    - Márgenes independientes (*Arriba*, *Abajo*, *Izquierda*, *Derecha*) con unidades (`px` / `%`).
  - **Logo del Partner / Marca (Bienvenida):**
    - Botón de visibilidad (*Visible / Oculto en Bienvenida*).
    - Vista previa del logo del partner/proyecto.
    - Alineación Vertical (*Arriba*, *Centro*, *Abajo*).
    - Alineación Horizontal (*Izq*, *Centro*, *Der*).
    - Tamaño / Ancho Máximo con unidades (`px` / `%`).
    - Márgenes independientes (*Arriba*, *Abajo*, *Izquierda*, *Derecha*) con unidades (`px` / `%`).

---

## 2. Archivos Modificados / Creados
1. `resources/js/components/events/PhotoManager.tsx`
2. `resources/js/components/events/MobileSimulator.tsx`
3. `public/dinvited.png`
4. `HANDOFF_CONTEXT.md`

---

## 3. Estado del Repositorio y Git
- Los cambios están listos para ser guardados en la rama principal (`main`).
- El comando `npm run build` compila sin ningún error de TypeScript ni sintaxis.

---

## 4. Próximos Pasos
1. **Revisar Verificación GPS y Registro:**
   - Confirmar si la pestaña **Verificación GPS** o **Registro** requiere ajustes visuales o de integración adicionales.
2. **Pruebas de Persistencia:**
   - Probar el guardado de `settings` en la base de datos al guardar la configuración del evento en `InvitationDesigner.tsx`.
