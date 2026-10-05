const Column = require('../models/Column');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/boards/:boardId/columns
// El Parent Check (que el tablero exista) ya lo hizo loadBoard
exports.createColumn = asyncHandler(async (req, res) => {
  const { title } = req.body || {};
  const column = await Column.create({ title, board: req.board._id });
  res.status(201).json(column);
});

// DELETE /api/boards/:boardId/columns/:columnId
// Se borra el DOCUMENTO (deleteOne) para que dispare el hook de cascada de tickets
exports.deleteColumn = asyncHandler(async (req, res) => {
  await req.column.deleteOne();
  res.status(204).send();
});
