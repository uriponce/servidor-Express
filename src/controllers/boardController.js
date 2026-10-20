import Board from '../models/Board.js';
import asyncHandler from '../utils/asyncHandler.js';

// POST /api/boards
export const createBoard = asyncHandler(async (req, res) => {
  const { title, description } = req.body || {};
  // Solo tomamos los campos permitidos (nunca req.body completo)
  const board = await Board.create({ title, description, owner: req.user._id });
  res.status(201).json(board);
});

// GET /api/boards
export const listBoards = asyncHandler(async (req, res) => {
  const boards = await Board.find({ owner: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(boards);
});

// GET /api/boards/:boardId
// req.board ya fue cargado (y su existencia verificada) por el middleware parentCheck('board')
export const getBoard = asyncHandler(async (req, res) => {
  await req.board.populate({
    path: 'columns',
    options: { sort: { createdAt: 1 } },
    populate: { path: 'tickets', options: { sort: { createdAt: 1 } } },
  });
  res.status(200).json(req.board);
});

// DELETE /api/boards/:boardId
export const deleteBoard = asyncHandler(async (req, res) => {
  await req.board.deleteOne();
  res.status(204).send();
});
