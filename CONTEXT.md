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
  - `/events/:id/invitations/:invitationId/designer` -> **Diseñador de Invitaciones Interactivas 2D/3D (Clon estilo Canva/Jitter)**.

## Avances Completados en esta Sesión:
1. **Diseñador de Invitaciones (`InvitationDesigner.tsx`)**:
   - Soporte para lienzo interactivo en formato móvil (1080x1920).
   - Inserción y edición de elementos (Textos con Google Fonts & fuentes personalizadas, WordArt SVG curvo, Imágenes, Videos, Botones interactivos como RSVP, Figuras y Audios).
   - Panel de capas con reordenamiento, agrupación (`Ctrl+G`), desagrupación (`Ctrl+Shift+G`), visibilidad y bloqueo.
   - Historial de cambios Undo/Redo (`Ctrl+Z`, `Ctrl+Y`) con pila de 15 estados.
   - Inspector de propiedades completo (tipografía, colores, bordes, sombras, animaciones).
2. **Generación Automática de Previews & Navegación**:
   - Implementado guardado de vista previa instantánea con `html2canvas`.
   - Transparencia visual para el usuario: la micro-captura ajusta temporalmente la opacidad del lienzo para evitar parpadeos o saltos de zoom.
   - La vista previa se almacena en `content.preview` de la invitación y se renderiza en la tarjeta de la izquierda en `http://localhost:8000/events/1/config?tab=INVITACION`.
   - Navegación mejorada: al salir del diseñador o guardar, se regresa a `/events/:id/config?tab=INVITACION`.

## Pendientes para Continuar Mañana:
1. **Perfeccionar la Vista Pública de Invitaciones (`/i/:slug` o `/i/:id`)**:
   - Construir la vista donde los invitados finales abren el diseño guardado en sus dispositivos móviles.
   - Implementar los efectos de entrada y animaciones configurados en el diseñador (`fadeIn`, `slideInUp`, `zoomIn`).
   - Conectar los botones interactivos del diseño (Confirmación RSVP, Mapa con Leaflet, Galería, etc.).
2. **Protocolo y Tótem de Recepción (Fases siguientes)**:
   - Pantalla de check-in en puerta y kiosco interactivo para eventos.

## Notas para el Desarrollador (Agente de IA)
1. Todas las dependencias están instaladas y verificadas con `npm run build`.
2. La vista previa utiliza `object-contain bg-white` en `InvitationManager.tsx` para mantener la relación de aspecto 9:16 intacta.
