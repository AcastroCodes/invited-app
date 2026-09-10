# Contexto de Desarrollo - Proyecto "Invited"

Este archivo fue generado automáticamente para que el modelo de IA del día siguiente pueda retomar el contexto de inmediato.

## Estado Actual del Proyecto (Día 1 Completado)
- **Stack:** Laravel 12 (API), React 19 (SPA), Vite, TailwindCSS v4.
- **Autenticación:** Implementada con Laravel Sanctum (Cookies Stateful). El hook `useAuth.tsx` maneja el estado del usuario (`user`, `login`, `register`, `logout`) y la sesión persiste sin usar localStorage para tokens.
- **UI Base Clonada:** Hemos migrado exitosamente el `AppLayout`, `Sidebar`, `Header` y `ThemeProvider` desde el proyecto `dInvitedapp`.
- **Rutas Principales (app.jsx):**
  - `/` -> Landing Page (Diseño original con globo 3D).
  - `/login` -> Funcional, conectado a Sanctum.
  - `/dashboard` -> Enrutado. Contiene gráficas (Recharts).
  - `/events` -> Listado de eventos funcional.
  - `/events/new` y `/events/:id/edit` -> `EventForm` implementado.
  - `/users` y `/partners` -> Listados implementados.

## Lo que se completó en la sesión anterior:
1. Migración total del entorno CSS. Tailwind v4 lee las variables `--bg-card`, `--text-main` correctamente para modo claro y oscuro.
2. Construcción de la migración y controlador `EventController.php` con operaciones CRUD y campos: `name`, `event_type`, `event_date`, `location`, `description`, `theme_color`, `status`, `guest_count`, `confirmed_count`.
3. Ajuste en el enrutamiento: El menú lateral apunta a rutas absolutas (`/users`, `/events`), por lo que `AppLayout` envuelve a estas rutas en el primer nivel del Router.

## Próximos Pasos Inmediatos (Fase 3 y 4)
- **Fase 3 (Logística):** Construir la gestión de invitados y planimetría (las rutas `/guests` y `/tables` del menú lateral actual necesitan reestructurarse para depender del ID de un evento).
- **Fase 4 (Diseñador 3D/Parallax):**
  - Desarrollar un clon de `Jitter.video` orientado a invitaciones web.
  - Construir un panel de lienzo libre, capas, e Inspector.
  - Generar el JSON estandarizado que incluye `parallax_depth` para aplicar el efecto giroscopio a los elementos.

## Nota para el Desarrollador (Agente de IA)
1. Antes de iniciar cualquier tarea, revisa este archivo.
2. Todas las dependencias ya están instaladas (`npm install` y `composer install` si se cambió de PC).
3. La base de datos es SQLite (`database/database.sqlite`), por lo que la data persiste entre PCs.
