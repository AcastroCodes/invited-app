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

### 1.2 Módulo de Fuentes y Textos de Precarga
- **Tarjeta Unificada:** Se consolidaron todos los controles en una única tarjeta contenedora alineada al sistema de diseño de *General -> Fuentes*.
- **Pestañas de Selección en la Cabecera (Lado Derecho):**
  - **Título:** Configura el texto principal (ej. *"Cargando"*).
  - **Contenido:** Configura el texto secundario (ej. *"Espere por favor"*).
  - **Powered by:** Configura el texto de marca del pie de página (ej. *"Powered by"*).
- **Controles Disponibles por Ítem:**
  - Campo de texto personalizado.
  - Selección de fuente (*FontPicker* con catálogo de Google Fonts).
  - Tamaño en píxeles (`px`) con botones de incremento/decremento `+` y `-`.
  - Formato (*Negrita*, *Itálica*, *Subrayado*).
  - Selector de color con Popover e input hexadecimal.

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

## 4. Próximos Pasos (Pendiente para Mañana)
1. **Revisar sub-pestañas adicionales de Bienvenida:**
   - Confirmar si la pestaña **Bienvenida** requiere controles adicionales para imágenes o botones.
   - Revisar la pestaña **Verificación GPS** y **Registro** para asegurar que todos los campos requeridos estén mapeados.
2. **Pruebas de Persistencia:**
   - Probar el guardado de `settings` en la base de datos al guardar la configuración del evento en `InvitationDesigner.tsx`.
