# Kanban API

API REST estilo Kanban (Tableros → Columnas → Tickets) con **Node.js 20, Express 4 y Mongoose 8**.
Rutas anidadas, verificación del recurso padre, aislamiento entre tableros, borrado en cascada
y respuestas HTTP semánticas.

## Requisitos
- Node.js 20+
- MongoDB local o MongoDB Atlas

## Instalación y uso
```bash
npm install
```

Crear `.env` desde `.env.example` y completar las variables antes de iniciar:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/kanban
JWT_SECRET=
CORS_ORIGIN=http://localhost:5173
```

Iniciar el servidor:

```bash
npm run dev               # desarrollo (nodemon)
npm start                 # producción
```

Generá un valor aleatorio de al menos 32 caracteres para `JWT_SECRET` (por ejemplo, con
`node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`). No reutilices el valor del
ejemplo ni lo publiques. Para varios orígenes permitidos, `CORS_ORIGIN` acepta una lista separada por comas.
En producción debe contener el origen exacto de `kanban-web`.

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `MONGODB_URI` | Cadena de conexión a MongoDB | `mongodb://127.0.0.1:27017/kanban` |
| `JWT_SECRET` | Secreto de firma JWT (mínimo 32 caracteres) | secreto aleatorio |
| `CORS_ORIGIN` | Orígenes permitidos, separados por comas | `http://localhost:5173` |

## Endpoints

| Método | Endpoint | Acción | Éxito |
|---|---|---|---|
| POST | `/api/auth/register` | Registra y autentica un usuario | 201 `{ token, user }` |
| POST | `/api/auth/login` | Inicia sesión | 200 `{ token, user }` |
| GET | `/api/auth/me` | Devuelve el usuario autenticado | 200 `{ user }` |
| GET | `/api/boards` | Lista los tableros del usuario | 200 |
| POST | `/api/boards` | Crea un tablero | 201 |
| GET | `/api/boards/:boardId` | Tablero con sus columnas pobladas | 200 |
| DELETE | `/api/boards/:boardId` | Elimina un tablero y sus datos | 204 |
| POST | `/api/boards/:boardId/columns` | Agrega una columna | 201 |
| DELETE | `/api/boards/:boardId/columns/:columnId` | Elimina una columna (y sus tickets) | 204 |
| POST | `/api/boards/:boardId/columns/:columnId/tickets` | Crea un ticket | 201 |
| PATCH | `/api/boards/:boardId/columns/:columnId/tickets/:ticketId` | Mueve un ticket o actualiza su contenido | 200 |
| DELETE | `/api/boards/:boardId/columns/:columnId/tickets/:ticketId` | Elimina un ticket | 204 |

Solo el registro, login y `GET /health` son públicos. `GET /api/auth/me` y las rutas de tableros requieren
`Authorization: Bearer <token>`. Los tableros quedan aislados por usuario.
Los tableros creados con versiones anteriores de la API, antes de incorporar propietarios, no se listan para
ninguna cuenta nueva; asignales un propietario de forma deliberada en MongoDB o recrealos.

### Ejemplos de body
```json
// POST /api/boards
{ "title": "Proyecto Web", "description": "Sprint 1" }

// POST /api/boards/:boardId/columns
{ "title": "Qué hacer" }

// POST .../tickets
{ "title": "Diseñar login", "description": "Wireframes" }

// PATCH .../tickets/:ticketId  (editar contenido)
{ "title": "Diseñar pantalla de login" }

// PATCH .../tickets/:ticketId  (mover a otra columna del MISMO tablero)
{ "column": "<id de la columna destino>" }
```

## Reglas de negocio implementadas

- **Parent Check**: antes de crear una columna se verifica que el tablero exista; antes de crear un ticket, que
  exista la columna. Si no, `404 Not Found` (nunca un 500).
- **Aislamiento de rutas**: si la columna existe pero pertenece a otro tablero, la petición se rechaza con `404`.
- **Aislamiento por usuario**: todas las operaciones de tableros solo consultan tableros cuyo `owner` coincide
  con el usuario autenticado.
- **Códigos HTTP**:
  - `400` payload inválido (ej. falta el título) o ID que no tiene 24 caracteres hexadecimales.
  - `404` ID con formato válido que no existe.
- **Borrado en cascada**: borrar una columna borra sus tickets (hook `pre('deleteOne')`).
- **PATCH idempotente**: el body expresa el estado final; se aplica con un `$set` atómico. Repetir la misma
  petición (por ejemplo por un fallo de red) deja la base en el mismo estado, y un movimiento ya aplicado
  responde `200` en lugar de error.
- **Formato de error global**: siempre `{ "error": "mensaje" }`.

## Estructura
```
src/
├── config/        conexión a la base de datos
├── models/        User.js, Board.js, Column.js, Ticket.js
├── controllers/   autenticación y lógica de tableros/columnas/tickets
├── routes/        authRoutes y rutas anidadas (boards → columns → tickets)
├── middlewares/   requireAuth, validateObjectId, parentCheck, errorHandler
├── utils/         HttpError, asyncHandler
├── app.js         configuración de Express
└── server.js      arranque del servidor
docs/
└── kanban-api.postman_collection.json   colección de pruebas
AGENTS.md                                 reglas del proyecto para agentes de IA (SDD)
```

## Pruebas
Importá `docs/kanban-api.postman_collection.json` en Postman (Collections → Import) y ejecutala de arriba
hacia abajo: la primera solicitud registra una cuenta y guarda el token para las siguientes. Incluye el camino
feliz y casos de error (400, 404, aislamiento entre tableros, reintento idempotente). En `test.http`, registrá
o iniciá sesión y copiá el token de la respuesta en `@token` antes de ejecutar las rutas protegidas.

## Despliegue (sugerido)
1. Crear un cluster en MongoDB Atlas y copiar la cadena de conexión.
2. Crear un Web Service Node (por ejemplo, en Render) con directorio raíz `servidor-Express`,
   Build Command `npm install` y Start Command `npm start`.
3. Definir `MONGODB_URI`, `JWT_SECRET` (secreto aleatorio de 32+ caracteres) y `CORS_ORIGIN` con el origen
   desplegado del frontend `kanban-web`. La plataforma define `PORT`.

## Convención de commits
Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
