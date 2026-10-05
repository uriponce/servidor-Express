import Board from '../models/Board.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/boards
export const createBoard = asyncHandler(async (req, res) => {
  const { title, description } = req.body || {};
  // Solo tomamos los campos permitidos (nunca req.body completo)
  const board = await Board.create({ title, description });
  res.status(201).json(board);
});

// GET /api/boards/:boardId
// req.board ya fue cargado (y su existencia verificada) por el middleware parentCheck('board')
export const getBoard = asyncHandler(async (req, res) => {
  await req.board.populate('columns');
  res.status(200).json(req.board);
});
