# Contexto de Desarrollo - Proyecto "Invited"

Este archivo mantiene el contexto del proyecto para retomar de inmediato en las siguientes sesiones de trabajo.

## Estado Actual del Proyecto (Última actualización: 14 de Septiembre, 2026)
- **Stack:** Laravel 12 (API), React 19 (SPA), Vite, TailwindCSS v4, HTML2Canvas.
- **Autenticación:** Implementada con Laravel Sanctum (Cookies Stateful) con el hook `useAuth.tsx`.
- **Rutas Principales (`app.jsx`):**
  - `/` -> Landing Page con globo 3D.
  - `/login` -> Inicio de sesión.
  - `/dashboard` -> Estadísticas e indicadores.
  - `/events` -> Listado de eventos.
  - `/events/:id/config` -> Pantalla unificada de servicios del evento (Invitados, Invitación, Protocolo, Tótem).
  - `/events/:id/invitations/:invitationId/designer` -> Diseñador de Invitaciones Interactivas 2D/3D (Clon estilo Canva/Jitter).
  - `/v/:id` -> **Visor Público de la Invitación (Player final para los invitados)**.

## Avances Completados en esta Sesión:
1. **Desarrollo del Visor Público (`InvitationViewer.tsx`)**:
   - Creación del reproductor de solo lectura para los invitados.
   - **Renderizado Fiel 1:1:** Implementación de lienzo lógico de 1080x1920 que se escala matemáticamente (`Math.min(scaleX, scaleY)`) para encajar perfecto en cualquier pantalla móvil sin recortes.
   - **Z-Index y Capas:** Sistema de renderizado sincronizado con el diseñador para respetar las posiciones de profundidad (`elements.length - index`).
   - **Transiciones de Escena:** Soporte para auto-avance de escenas por temporizador y animaciones de transición (Fade, Slide, Zoom).
   - **Correcciones de Compatibilidad:** Uso de `h-screen` en lugar de `100dvh` para evitar colapsos de tamaño en navegadores móviles más antiguos.
2. **Diseñador de Invitaciones (`InvitationDesigner.tsx`)**:
   - Agregado el botón **"Preview"** en la barra superior para lanzar el visor inmediatamente.
   - Refinado el inspector de escena (colores y elementos para acoplar al estilo del proyecto).

## Pendientes para Continuar Mañana:
1. **Animaciones en los Elementos del Visor**:
   - Aunque ya hay transiciones de escena, **faltan los efectos de entrada de cada elemento individual** (ej. `fadeIn`, `slideInUp`, `zoomIn`) configurados en el diseñador.
2. **Interactividad Real en la Invitación**:
   - Programar la funcionalidad real de los botones interactivos (Abrir Modal de Confirmación RSVP, lanzar Mapas con Leaflet, Galería, etc.).
3. **Protocolo y Tótem de Recepción (Fases siguientes)**:
   - Pantalla de check-in en puerta y kiosco interactivo para el día del evento.

## Notas para el Desarrollador (Agente de IA)
1. El proyecto local se levanta normalmente con `npm run dev`. Si se quiere previsualizar en celular conectado al mismo Wi-Fi, usar manualmente `php artisan serve --host=192.168.0.x` y `vite --host=192.168.0.x`.
2. El contenedor del visor DEBE mantener la proporción de 1080x1920 escalada por CSS en todo momento para garantizar fidelidad entre el lienzo de diseño y la vista del invitado final.
