import Board from '../models/Board.js';
import Column from '../models/Column.js';
import HttpError from '../utils/HttpError.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * parentCheck — Verificación de existencia y pertenencia jerárquica (AGENTS.md §2, §4.1)
 *
 * Uso:
 *   parentCheck('board')    → verifica que req.params.boardId exista  → deja req.board
 *   parentCheck('column')   → verifica que req.params.columnId exista y pertenezca
 *                             al tablero ya cargado en req.board       → deja req.column
 */
export function parentCheck(resource) {
  if (resource === 'board') {
    return asyncHandler(async (req, res, next) => {
      // Parent Check del tablero: si no existe, aborta con 404
      const board = await Board.findById(req.params.boardId);
      if (!board) throw new HttpError(404, 'Tablero no encontrado');
      req.board = board;
      next();
    });
  }

  if (resource === 'column') {
    return asyncHandler(async (req, res, next) => {
      // Parent Check de la columna + aislamiento de rutas anidadas:
      // 1) la columna debe existir (404)
      // 2) la columna debe pertenecer al tablero de la URL (404 si es de otro tablero)
      const column = await Column.findById(req.params.columnId);
      if (!column) throw new HttpError(404, 'Columna no encontrada');
      if (!column.board.equals(req.board._id)) {
        throw new HttpError(404, 'La columna no pertenece a este tablero');
      }
      req.column = column;
      next();
    });
  }

  throw new Error(`parentCheck: recurso desconocido "${resource}"`);
}
