const Column = require('../models/Column');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');

// Parent Check de la columna + aislamiento de rutas:
// 1) la columna debe existir (404)
// 2) la columna debe pertenecer al tablero de la URL (404 si es de otro tablero)
module.exports = asyncHandler(async (req, res, next) => {
  const column = await Column.findById(req.params.columnId);
  if (!column) throw new HttpError(404, 'Columna no encontrada');
  if (!column.board.equals(req.board._id)) {
    throw new HttpError(404, 'La columna no pertenece a este tablero');
  }
  req.column = column;
  next();
});
