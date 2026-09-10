# Análisis de la Interfaz de Diseño en Jitter.video

Al intentar acceder al enlace específico que me proporcionaste, el motor de renderizado gráfico del navegador automatizado tuvo problemas para cargar el lienzo interactivo (WebGL). Sin embargo, conozco perfectamente cómo está estructurada la arquitectura de la interfaz de **Jitter** y cómo administra el diseño y la animación. 

Jitter está diseñado de manera muy similar a Figma, pero con un enfoque centrado en la línea de tiempo. A continuación te detallo cómo maneja cada uno de los apartados que mencionaste:

## 1. Administración de Elementos (Panel de Capas y Lienzo)

La gestión de los elementos en escena se realiza mediante un sistema clásico de capas jerárquicas:

- **Panel de Capas (Izquierda):** Todos los elementos (textos, formas, imágenes, grupos y artboards/frames) se listan en el panel izquierdo. 
- **Jerarquía y Z-Index:** El orden de los elementos en este panel determina qué objeto está por encima de otro (profundidad). Se agrupan arrastrando y soltando (Drag & Drop) un elemento dentro de otro.
- **Interacción en el Lienzo:** Al seleccionar un elemento en el *canvas* central, aparecen controles vectoriales (Bounding Box) que permiten escalar, rotar y modificar el radio de los bordes directamente arrastrando los tiradores.

## 2. Administración de Propiedades (Panel Inspector)

Las propiedades de cada elemento seleccionado se controlan desde el **Panel Derecho (Inspector)**. Este panel es dinámico y cambia según el tipo de elemento seleccionado:

- **Layout y Transformación:** Controles precisos para Posición ($X, Y$), Tamaño (Ancho/Alto), Rotación y Opacidad.
- **Estilos Visuales (Fill, Stroke, Effects):** 
  - **Relleno (Fill):** Permite colores sólidos, gradientes o imágenes de fondo.
  - **Bordes (Stroke):** Grosor, color y alineación (interior, centro, exterior).
  - **Efectos:** Sombras (Drop shadow) y desenfoques (Blur).
- **Tipografía:** Si el elemento es un texto, aparecen opciones de fuente, peso tipográfico, tamaño, interlineado y alineación.

## 3. Administración de la Animación (Línea de Tiempo)

El sistema de animación de Jitter es su característica más potente, combinando accesibilidad con control avanzado en el **Panel Inferior**:

- **Sistema basado en Presets (In / Out / Custom):** A diferencia de After Effects donde debes crear todo desde cero, Jitter te permite seleccionar un elemento y hacer clic en "Animate". Las animaciones se dividen en **Entrada (In)** (ej. *Fade In*, *Slide In*), **Salida (Out)** y **Personalizadas**.
- **Bloques en la Línea de Tiempo (Timeline Blocks):** En lugar de ver docenas de puntos (keyframes), ves la animación como un "bloque" sólido en la línea de tiempo. 
  - Arrastrar el bloque entero cambia *cuándo* ocurre la animación (Delay).
  - Estirar los extremos del bloque cambia *cuánto dura* la animación (Speed/Duration).
- **Control Avanzado (Easing y Keyframes):** Al seleccionar un bloque de animación, el panel derecho muestra opciones para la **curva de transición (Easing)** (Lineal, Ease In/Out, Rebote, etc.). Si necesitas control detallado, puedes expandir el bloque para ver y modificar los **Keyframes** individuales de propiedades específicas (como mover solo la $X$ o la Opacidad).

---

> [!NOTE]
> La interfaz de Jitter es un excelente referente si deseas construir una herramienta de diseño interactiva. El secreto de su éxito es que abstrae la complejidad de los *keyframes* matemáticos detrás de "bloques de tiempo" visuales y "animaciones prefabricadas", dejando los controles manuales solo para cuando el usuario quiere hacer un ajuste fino.
