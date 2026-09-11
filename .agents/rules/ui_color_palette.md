# Regla de Estilos y Colores de Componentes UI en React

## Paleta de Colores Obligatoria del Proyecto
Todos los componentes de la interfaz de usuario en React (`select`, `input`, `option`, `datepicker`, `timepicker`, `modales`, `botones` y menus contextuales) DEBEN aplicar estrictamente las variables de tema y la paleta de colores oficial del proyecto:

- **Color Primario (Coral / Accent):** `#E07A5F` (`var(--primary-accent)`)
- **Color Secundario (Oro / Highlights):** `#F2CC8F` (`var(--secondary-accent)`)
- **Fondo Card / Dropdowns:** `#FFFFFF` en modo claro (`var(--bg-card)`), `#171717` en modo oscuro.
- **Texto Principal:** `#212121` en modo claro (`var(--text-main)`), `#F5F5F5` en modo oscuro.
- **Border / Separadores:** `var(--border-color)`

## Reglas para Selects y Menús Desplegables (`<select>` y `<option>`)
1. **Contenedores `<select>`:** 
   - Siempre llevar el foco en Coral (`focus:border-[#E07A5F]` y `focus:ring-[#E07A5F]`).
   - El fondo debe coincidir con `var(--bg-card)` y el texto con `var(--text-main)`.

2. **Opciones despegables (`<option>`):**
   - No usar colores por defecto del navegador (azul o gris genérico).
   - Aplicar siempre `bg-[var(--bg-card)]` y `text-[var(--text-main)]`.
   - La opción seleccionada o activa debe usar el fondo Coral (`#E07A5F`) con texto blanco o contraste alto.

3. **Datepickers & Timepickers:**
   - Los controles `input[type="date"]` e `input[type="time"]` deben usar `accent-color: var(--primary-accent)` y los iconos de calendario/reloj deben estilizarse en Coral (`#E07A5F`).
   - Las horas de inicio y fin deben ser de formato de 12 horas (AM/PM) usando selectores estilizados con los colores del proyecto.

4. **Mapas Interactivos (Leaflet / Pins):**
   - El marcador/pin interactivo siempre debe usar el gradiente Coral a Oro (`#E07A5F` a `#F2CC8F`) con anclaje preciso del marker.
