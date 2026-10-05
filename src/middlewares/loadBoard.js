const Board = require('../models/Board');
const HttpError = require('../utils/HttpError');
const asyncHandler = require('../utils/asyncHandler');

// Parent Check del tablero: si no existe, aborta con 404.
// Si existe, lo deja en req.board para que lo use el resto de la cadena.
module.exports = asyncHandler(async (req, res, next) => {
  const board = await Board.findById(req.params.boardId);
  if (!board) throw new HttpError(404, 'Tablero no encontrado');
  req.board = board;
  next();
});
