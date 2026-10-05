# AGENTS.md — API REST Kanban

## Stack estricto
- Node.js 20, Express 4, Mongoose 8, dotenv. Sin otras librerías sin consultar.

## Arquitectura
- Responsabilidad única: `models/`, `controllers/`, `routes/`, `middlewares/`, `utils/` separados.
- Las rutas SOLO enlazan URL + middlewares + controlador. NO mezclar lógica de base de datos en las rutas.
- Referencias del hijo al padre (`Ticket.column`, `Column.board`). El padre NO guarda arrays de hijos;
  se obtienen con virtual populate.

## Errores
- Siempre responder `{ "error": "mensaje" }` en caso de fallo, desde el manejador global (`errorHandler`).
- Controladores y middlewares lanzan `HttpError(status, mensaje)`; no arman respuestas de error a mano.

## Límites negativos
- NO devolver 500 genérico si un boardId/columnId no existe: devolver 404.
- NO devolver errores de casteo de Mongoose por IDs mal formados: validar antes con `validateObjectId` (400).
- NO usar arrays simples para anidar tickets dentro de columnas: usar referencias (ObjectId).
- NO usar `findByIdAndDelete` ni `Model.deleteOne()` para borrar con cascada: buscar el documento y llamar `doc.deleteOne()`.
- NO pasar `req.body` completo a `create`/`update`: tomar solo los campos permitidos.
- NO implementar rutas planas para crear tickets (`/api/tickets`).

## Contrato de la API (fuente de la verdad)
| Método | Endpoint | Acción | Éxito |
|---|---|---|---|
| POST | /api/boards | Crea un tablero | 201 |
| GET | /api/boards/:boardId | Tablero con columnas pobladas | 200 |
| POST | /api/boards/:boardId/columns | Agrega una columna | 201 |
| DELETE | /api/boards/:boardId/columns/:columnId | Elimina una columna (y sus tickets) | 204 |
| POST | /api/boards/:boardId/columns/:columnId/tickets | Crea un ticket | 201 |
| PATCH | /api/boards/:boardId/columns/:columnId/tickets/:ticketId | Mueve o actualiza un ticket | 200 |

## Códigos de error
- 400: payload inválido, ID con formato inválido, columna destino de otro tablero.
- 404: ID válido que no existe, o columna/ticket que no pertenece al padre de la URL.

## Idempotencia
- El PATCH describe el estado final y se aplica con un único `$set` atómico; repetirlo no cambia el resultado.
