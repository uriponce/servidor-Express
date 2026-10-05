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
cp .env.example .env      # completá MONGODB_URI
npm run dev               # desarrollo (nodemon)
npm start                 # producción
```

Variables de entorno (`.env.example`):

| Variable | Descripción | Ejemplo |
|---|---|---|
| `PORT` | Puerto del servidor | `3000` |
| `MONGODB_URI` | Cadena de conexión a MongoDB | `mongodb://127.0.0.1:27017/kanban` |

## Endpoints

| Método | Endpoint | Acción | Éxito |
|---|---|---|---|
| POST | `/api/boards` | Crea un tablero | 201 |
| GET | `/api/boards/:boardId` | Tablero con sus columnas pobladas | 200 |
| POST | `/api/boards/:boardId/columns` | Agrega una columna | 201 |
| DELETE | `/api/boards/:boardId/columns/:columnId` | Elimina una columna (y sus tickets) | 204 |
| POST | `/api/boards/:boardId/columns/:columnId/tickets` | Crea un ticket | 201 |
| PATCH | `/api/boards/:boardId/columns/:columnId/tickets/:ticketId` | Mueve un ticket o actualiza su contenido | 200 |

Utilitario: `GET /health` → `200 { "status": "ok" }`.

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
├── models/        Board.js, Column.js, Ticket.js
├── controllers/   lógica de cada endpoint
├── routes/        rutas anidadas (boards → columns → tickets)
├── middlewares/   validateObjectId, loadBoard, loadColumn, errorHandler
├── utils/         HttpError, asyncHandler
├── app.js         configuración de Express
└── server.js      arranque del servidor
docs/
└── kanban-api.postman_collection.json   colección de pruebas
AGENTS.md                                 reglas del proyecto para agentes de IA (SDD)
```

## Pruebas
Importá `docs/kanban-api.postman_collection.json` en Postman o en Thunder Client (Collections → Import).
Incluye el camino feliz y los casos de error (400, 404, aislamiento entre tableros, reintento idempotente).
Orden recomendado: ejecutarla de arriba hacia abajo. Si tu herramienta no ejecuta los scripts de la
colección, copiá a mano los `_id` devueltos en las variables `boardId`, `columnId`, `columnId2`, `ticketId`
y `boardId2`.

## Despliegue (sugerido)
1. Crear un cluster gratuito en MongoDB Atlas y copiar la cadena de conexión.
2. Crear un Web Service en Render (o similar) apuntando al repositorio:
   Build Command `npm install`, Start Command `npm start`.
3. Definir la variable de entorno `MONGODB_URI` en el panel del servicio (`PORT` la define la plataforma).

## Convención de commits
Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
