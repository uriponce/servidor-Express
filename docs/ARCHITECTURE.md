# Arquitectura del frontend

## Objetivo
SPA para gestionar tableros Kanban sobre la API REST de `servidor-Express`. El criterio rector es la **separación de
responsabilidades**: la UI no conoce HTTP y los servicios no conocen React.

## Decisiones y justificación

| Decisión | Por qué |
|---|---|
| **React 18 + Vite** | Pedido por la especificación. Vite da arranque y HMR rápidos y expone variables de entorno con `import.meta.env`. |
| **JavaScript (sin TypeScript)** | Coherente con el backend (Node/Express/Mongoose en JS) y con el alcance del curso. |
| **React Router DOM v6** | Rutas anidadas con *layout routes*: `ProtectedRoute` y `AppLayout` envuelven las páginas privadas sin repetir código. |
| **Axios (una sola instancia)** | Interceptores centralizados: añade el `Bearer token`, normaliza todo error a `ApiError {status, message}` y detecta 401 para cerrar sesión. |
| **TanStack Query** | Gestiona caché, loading/error y reintentos del estado de *servidor*. Permite la UI optimista (`onMutate` / rollback / `onSettled`) sin escribir un store a mano. |
| **Context API** (sesión y tema) | Son estados de *cliente*, pocos y estables: no justifican Redux/Zustand. |
| **React Hook Form + Zod** | Formularios con poca re-renderización; Zod define los límites (iguales a los del backend) en un solo esquema por feature. |
| **react-hot-toast** | Notificaciones livianas para el aviso de fallo al mover tickets. |
| **CSS propio con Custom Properties** | Cumple la regla «sin hex en componentes». El tema entero cambia con una clase en `<html>`. Sin dependencia de un framework CSS. |
| **Drag & drop HTML5 nativo** | Cero dependencias. Se complementa con un `<select>` «Mover a…» para teclado y pantallas táctiles, donde el DnD nativo no funciona. |

## Capas
```
pages / routes  →  features (contenedores + hooks)  →  api (servicios Axios)  →  backend
                          ↓
                 components + presentacionales (props in, JSX out)
```
- **Presentacionales** (`components/`, `TicketCard`, `Column`, `BoardCard`): sin efectos ni API.
- **Contenedores** (`KanbanBoard`, páginas, formularios): hooks de React Query, estado local, diálogos.
- **Servicios** (`api/*Service.js`): una función por endpoint; devuelven `data` o lanzan `ApiError`.

## Flujo de datos
1. La página llama a un hook (`useBoardQuery`) → React Query ejecuta `boardService.getById`.
2. `GET /boards/:id` trae el árbol `columns[].tickets[]`; se cachea bajo `['boards', boardId]`.
3. Las mutaciones invalidan esa clave; la UI se actualiza con el servidor como fuente de verdad.

## UI optimista al mover un ticket
`useMoveTicket`:
1. `onMutate`: cancela refetches en curso, guarda un *snapshot* y aplica `moveTicketInBoard` (función pura) a la caché.
2. `onError`: restaura el snapshot y muestra un Toast con el mensaje del backend.
3. `onSettled`: si es la última movida en vuelo, invalida la query para resincronizar.

El `PATCH` es idempotente en el backend (estado final en un `$set`), por lo que reintentar tras un fallo de red es seguro.

## Errores del backend en formularios
`lib/serverErrors.js` convierte un `ApiError` 4xx en un error de campo (`setError`) —por *matchers* de mensaje o
campo por defecto— y los 401/5xx/red en un error general (`errors.root.server`). El usuario ve el problema en
el input sin recargar la página. Limitación: el backend responde `{ error: "mensaje" }` sin código de campo, por eso
se asigna por coincidencia de texto.

## Sesión y seguridad
- Token JWT y usuario en `localStorage`. Es simple y suficiente para este proyecto, pero expone el token a XSS;
  en producción real conviene cookie `HttpOnly`.
- Ante un 401 en una ruta protegida: toast, cierre de sesión y limpieza de la caché de Query.
- La protección de rutas del cliente es solo UX: la seguridad real la aplica el backend (`requireAuth` y filtrado por dueño).

## Tema
- `tokens.css` define paleta y derivados para `:root` y `:root.dark`.
- `index.html` aplica la clase `.dark` con un script **antes** del render (evita parpadeo).
- `ThemeProvider` toma ese estado inicial, sigue al sistema mientras no haya elección explícita y persiste la
  elección en `localStorage` (`kanban-theme`).
- En modo oscuro el texto sobre el acento es oscuro (`--on-accent`) para mantener contraste AA con `#818CF8`.

## Mocks
`VITE_USE_MOCKS=true` cambia el adaptador de Axios por `api/mock/mockAdapter.js`, que reproduce rutas, códigos
HTTP y el formato `{ error }` del backend con datos de `mockData.js`. Los servicios y la UI no cambian.

## Limitaciones conocidas
- El orden de los tickets dentro de una columna es por fecha de creación (el backend no guarda posición); al mover,
  el ticket aparece al final de la columna destino.
- El modal no implementa *focus trap*.
- No hay tests automatizados todavía.
