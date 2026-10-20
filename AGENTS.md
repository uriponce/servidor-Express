# AGENTS.md — Frontend Kanban (reglas para agentes de IA)

> Este archivo es la **fuente de la verdad** del frontend. Leelo completo antes de escribir código.
> Si una instrucción del usuario contradice este archivo, avisá la contradicción antes de implementar.
> El contrato del backend vive en `../servidor-Express/AGENTS.md` (y `docs/` del backend). No inventes endpoints.

## 1. Stack fijo (no agregar librerías sin consultar)
Alineado con el backend (JavaScript, sin TypeScript, Node 20+).

| Capa | Elección |
|---|---|
| UI | React 18 + Vite 5 (JavaScript, JSX) |
| Rutas | React Router DOM v6 (`createBrowserRouter` no; se usa `<BrowserRouter>` + `<Routes>`) |
| HTTP | Axios (una única instancia en `src/api/httpClient.js`) |
| Estado de servidor | TanStack Query v5 (React Query) |
| Estado de sesión y tema | Context API + custom hooks |
| Formularios | React Hook Form + Zod (`@hookform/resolvers`) |
| Notificaciones | react-hot-toast |
| Estilos | CSS propio con Custom Properties (sin Tailwind/Bootstrap) |
| Drag & drop | API nativa HTML5 (sin librerías) |

## 2. Estructura de directorios
```
src/
├── api/        # Funciones aisladas de llamada a los endpoints REST (+ mock/)
├── components/ # UI reutilizable y "tonta" (Button, Input, Modal, Spinner…)
├── features/   # Módulos por dominio: auth, boards, columns, tickets
├── hooks/      # Hooks reutilizables (useAuth, useTheme…)
├── lib/        # queryClient, helpers de errores/validación
├── pages/      # Vistas asociadas a rutas
├── routes/     # Configuración de React Router (AppRoutes, ProtectedRoute)
└── styles/     # tokens.css (ÚNICO lugar con colores), base.css
```

## 3. Patrón de componentes
- **Presentacionales** (`components/`, y los `*Card`/`*Column` de `features/`): solo reciben props y
  renderizan. **Prohibido** `useEffect`, `fetch`/Axios, React Query o Context de datos dentro de ellos.
- **Contenedores / Páginas** (`pages/`, `features/*/*Container*`, hooks `use*`): manejan lógica, llamadas a
  la API y estado. Las llamadas HTTP SOLO se hacen desde `src/api/`, y se consumen desde hooks de
  `features/*/` (React Query). **Nunca** `axios`/`fetch` dentro de un componente.
- Componentes chicos: si supera ~150 líneas, dividilo.

## 4. Matriz de rutas
| Ruta | Componente | Acceso | Descripción |
|---|---|---|---|
| `/login` | `LoginPage` | Público (si hay sesión → `/boards`) | Formulario de autenticación |
| `/register` | `RegisterPage` | Público | Alta de cuenta |
| `/boards` | `BoardsListPage` | Protegido | Lista de tableros del usuario; crear/eliminar |
| `/boards/:boardId` | `BoardDetailPage` | Protegido | Vista Kanban: columnas y tickets anidados |
| `/` | — | — | Redirige a `/boards` |
| `*` | `NotFoundPage` | Público | 404 |

Ruta protegida sin sesión → redirige a `/login` recordando la ruta de origen.

**Límite negativo (React Router):** NO usar `<Link>` para acciones de mutación (crear, borrar, mover
tickets). Usar navegación programática (`useNavigate`) **únicamente después** de que la mutación en la API
haya sido exitosa. `<Link>` solo para navegación pura (ir a un tablero).

## 5. Formularios y validación
1. Todo formulario usa **React Hook Form + Zod**. Los esquemas viven junto a su feature.
2. Los errores del backend (400, 401, 409…) se **mapean a los campos del formulario** (`setError`) o a un
   error general del formulario, **sin recargar la página** (ver `lib/serverErrors.js`).
3. **Todo formulario que haga POST, PATCH o DELETE deshabilita el botón de envío
   (`disabled={isSubmitting}`) y muestra un spinner** mientras la petición está en curso.
4. Los límites de Zod reflejan los del backend: título de tablero/columna ≤ 100, ticket ≤ 150,
   contraseña ≥ 6, nombre ≤ 60.

## 6. UI optimista (mover tickets)
- Mover un ticket de columna (`PATCH .../tickets/:ticketId` con `{ column }`) es **optimista**: se actualiza la
  caché local antes de la respuesta.
- Si el backend responde error (400/404/red), **se revierte** el ticket a su columna original y se muestra un
  **Toast** con el fallo. Al terminar (éxito o error) se invalida la query para resincronizar.
- Crear/editar/borrar son peticiones estándar: se espera el 2xx y luego se refresca.

## 7. Entorno y mocks
- La URL base de la API se lee **solo** de `import.meta.env.VITE_API_URL` (ver `.env.example`).
- `VITE_USE_MOCKS=true` reemplaza el adaptador HTTP por uno en memoria (`src/api/mock/`) basado en
  `mockData.js`, que imita el contrato del backend (incluidos los códigos de error). Permite desarrollar sin
  servidor.

## 8. Tema (Light/Dark) — Estilo elegido: «Minimalismo Developer»
- Prohibido hardcodear colores hexadecimales fuera de `src/styles/tokens.css`. Los componentes usan solo
  variables: `--bg-primary`, `--bg-card`, `--text-primary`, `--accent-color` (y derivadas).
- Paleta obligatoria:

| Token | Light | Dark |
|---|---|---|
| `--bg-primary` | `#F9FAFB` | `#0F172A` |
| `--bg-card` | `#FFFFFF` | `#1E293B` |
| `--text-primary` | `#111827` | `#F8FAFC` |
| `--accent-color` | `#4F46E5` | `#818CF8` |

- Inicialmente se respeta `prefers-color-scheme`. La elección explícita del usuario (interruptor) agrega/quita
  la clase `.dark` en `<html>` y se guarda en `localStorage` (`kanban-theme`).
- Un script inline en `index.html` aplica el tema **antes** del primer render para evitar el parpadeo.
- Tipografía: sans del sistema para texto; **monoespaciada** para IDs de tickets y metadatos.
- Accesibilidad: contraste AA, foco visible, controles operables por teclado, `aria-*` en modales y errores.

## 9. Backend: contrato consumido (fuente de la verdad: `servidor-Express`)
Todas las rutas `/api/boards/**` exigen `Authorization: Bearer <token>`.
| Método | Endpoint | Éxito | Notas |
|---|---|---|---|
| POST | `/api/auth/register` | 201 `{ token, user }` | 400 validación, 409 email repetido |
| POST | `/api/auth/login` | 200 `{ token, user }` | 401 credenciales |
| GET | `/api/auth/me` | 200 `{ user }` | 401 |
| GET | `/api/boards` | 200 `[board]` | solo del usuario |
| POST | `/api/boards` | 201 board | `{ title, description }` |
| GET | `/api/boards/:boardId` | 200 | `columns[].tickets[]` anidados |
| DELETE | `/api/boards/:boardId` | 204 | cascada |
| POST | `/api/boards/:boardId/columns` | 201 | `{ title }` |
| DELETE | `/api/boards/:boardId/columns/:columnId` | 204 | cascada de tickets |
| POST | `.../columns/:columnId/tickets` | 201 | `{ title, description }` |
| PATCH | `.../tickets/:ticketId` | 200 | `{ title? description? column? }` (idempotente) |
| DELETE | `.../tickets/:ticketId` | 204 | |
Errores: siempre `{ "error": "mensaje" }`.

## 10. Convenciones
- Código y comentarios en español; nombres de identificadores en inglés.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`).
- Antes de dar una tarea por terminada: `npm run build` sin errores y flujo probado contra la API (o mocks).

## 11. Fases de trabajo (SDD)
1. Capa de servicio `src/api` → 2. Componentes atómicos sin API → 3. Features, páginas y rutas →
4. Optimistic UI y tema → 5. Documentación y despliegue. No mezclar fases en un mismo paso.
