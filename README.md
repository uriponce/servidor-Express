# Kanban Web

Frontend de la aplicación Kanban (Tableros → Columnas → Tickets). Este proyecto contiene solo el cliente web;
la API Express vive en el proyecto hermano [`servidor-Express`](../servidor-Express/README.md).
Construido con **React 18 + Vite**, siguiendo Desarrollo Basado en Especificaciones: las reglas viven en
[`AGENTS.md`](./AGENTS.md) y las decisiones de diseño en [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Requisitos
- Node.js 20+
- El backend `servidor-Express` corriendo (o `VITE_USE_MOCKS=true` para trabajar sin él)

## Puesta en marcha
En `servidor-Express`, crear su `.env` desde `.env.example`, configurar MongoDB y arrancar con `npm run dev`.
En otra terminal, desde esta carpeta:

```bash
npm install
Copy-Item .env.example .env # PowerShell; ajustar VITE_API_URL si el backend usa otra URL
npm run dev              # http://localhost:5173
npm run build            # genera dist/
npm run preview          # sirve dist/ localmente
```

La configuración local está en `.env.local` (ignorado por Git). Para modificarla, definí:

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API (incluye `/api`) | `http://localhost:3000/api` |
| `VITE_USE_MOCKS` | `true` = datos simulados en memoria, sin backend | `false` |

Iniciar el backend en otra terminal, desde `servidor-Express`, siguiendo sus instrucciones. El front no sirve
ni incluye el servidor Express.
Después de cambiar variables de Vite, reiniciá `npm run dev` para que tome los nuevos valores.

Con `VITE_USE_MOCKS=true` podés entrar con `demo@kanban.dev` / `demo1234`. El ticket «Probar rollback [fail]»
rechaza a propósito el movimiento para ver la reversión de la UI optimista.

## Funcionalidades
- Registro, login y rutas protegidas (JWT).
- Lista de tableros: crear y eliminar.
- Tablero Kanban: columnas y tickets anidados; crear, editar, eliminar; **mover tickets arrastrando** (o con el
  selector «Mover a…», útil en táctil y teclado) con **UI optimista** y rollback con Toast.
- Tema claro/oscuro: respeta el sistema, el interruptor persiste en `localStorage`, sin parpadeo al cargar.
- Formularios con React Hook Form + Zod; errores del backend mostrados en el campo; botón deshabilitado + spinner
  durante el envío.

## Rutas
| Ruta | Página | Acceso |
|---|---|---|
| `/login`, `/register` | `LoginPage`, `RegisterPage` | Público |
| `/boards` | `BoardsListPage` | Protegido |
| `/boards/:boardId` | `BoardDetailPage` | Protegido |

## Estructura
```
src/
├── api/        servicios HTTP (Axios) + mock/ (adaptador en memoria y mockData.js)
├── components/ UI presentacional reutilizable
├── features/   auth · boards · columns · tickets (componentes, formularios, hooks de React Query)
├── hooks/      useAuth, useTheme
├── lib/        queryClient, queryKeys, serverErrors
├── pages/      vistas de las rutas
├── routes/     React Router: AppRoutes, ProtectedRoute, PublicOnlyRoute, AppLayout
└── styles/     tokens.css (único lugar con colores), base.css, components.css, features.css
```

## Despliegue
Es un sitio estático (SPA). En **Vercel** o **Netlify**:
1. Desplegar `servidor-Express` como un servicio Node (por ejemplo, en Render), con directorio raíz
   `servidor-Express`; configurar `MONGODB_URI`, `JWT_SECRET` (secreto aleatorio de al menos 32 caracteres)
   y `CORS_ORIGIN` con el origen exacto del frontend.
2. Desplegar `kanban-web` como sitio estático (por ejemplo, en Vercel), con directorio raíz `kanban-web`,
   build command `npm run build` y output `dist`.
3. Definir `VITE_API_URL` apuntando a la URL pública del backend más `/api`
   (p. ej. `https://tu-api.onrender.com/api`). El rewrite a `index.html` ya está en `vercel.json` y
   `public/_redirects` (necesario para `/boards/:id`).

Las variables `VITE_*` se incorporan **en el build**: si cambiás `VITE_API_URL`, volvé a desplegar. No se
incluyen secretos en el frontend.

## Convención de commits
Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
