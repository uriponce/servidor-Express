import Column from '../models/Column.js';
import Ticket from '../models/Ticket.js';
import HttpError from '../utils/HttpError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { isObjectId } from '../middlewares/validateObjectId.js';

// POST /api/boards/:boardId/columns/:columnId/tickets
// El Parent Check (tablero y columna) ya lo hicieron parentCheck('board') y parentCheck('column')
export const createTicket = asyncHandler(async (req, res) => {
  const { title, description } = req.body || {};
  const ticket = await Ticket.create({ title, description, column: req.column._id });
  res.status(201).json(ticket);
});

const ALLOWED_FIELDS = ['title', 'description', 'column'];

// PATCH /api/boards/:boardId/columns/:columnId/tickets/:ticketId
// Actualiza el contenido (title, description) y/o mueve el ticket (column = id destino).
// Es IDEMPOTENTE: el body describe el estado final deseado (no "sumar" ni "agregar"),
// y se aplica con un único $set atómico. Repetir la misma petición deja el mismo estado.
export const updateTicket = asyncHandler(async (req, res) => {
  const body = req.body || {};

  const updates = {};
  for (const field of ALLOWED_FIELDS) {
    if (body[field] !== undefined) updates[field] = body[field];
  }
  if (Object.keys(updates).length === 0) {
    throw new HttpError(400, 'Debe enviar al menos uno de estos campos: title, description, column');
  }

  if (updates.title !== undefined) {
    if (typeof updates.title !== 'string' || updates.title.trim() === '') {
      throw new HttpError(400, 'El título del ticket no puede estar vacío');
    }
  }
  if (updates.description !== undefined && typeof updates.description !== 'string') {
    throw new HttpError(400, 'La descripción debe ser texto');
  }

  // Columnas donde el ticket puede estar para que esta petición sea válida.
  // Siempre la de la URL; si es un movimiento, también la destino
  // (así, reintentar un movimiento ya aplicado devuelve 200 en vez de 404).
  const allowedColumns = [req.column._id];

  if (updates.column !== undefined) {
    if (!isObjectId(updates.column)) {
      throw new HttpError(400, 'column no es un ObjectId válido');
    }
    const target = await Column.findById(updates.column);
    if (!target) throw new HttpError(404, 'Columna destino no encontrada');
    if (!target.board.equals(req.board._id)) {
      throw new HttpError(400, 'La columna destino pertenece a otro tablero');
    }
    updates.column = target._id;
    allowedColumns.push(target._id);
  }

  // Búsqueda + actualización en UNA sola operación atómica en la base de datos
  // (evita condiciones de carrera entre leer y luego escribir)
  const ticket = await Ticket.findOneAndUpdate(
    { _id: req.params.ticketId, column: { $in: allowedColumns } },
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!ticket) throw new HttpError(404, 'Ticket no encontrado en esta columna');

  res.status(200).json(ticket);
});
