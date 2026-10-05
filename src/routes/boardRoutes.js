const express = require('express');
const { createBoard, getBoard } = require('../controllers/boardController');
const { validateObjectId } = require('../middlewares/validateObjectId');
const loadBoard = require('../middlewares/loadBoard');
const columnRoutes = require('./columnRoutes');

const router = express.Router();

router.post('/', createBoard);
router.get('/:boardId', validateObjectId('boardId'), loadBoard, getBoard);

// Ruta anidada: todo lo de columnas pasa primero por validar + verificar el tablero
router.use('/:boardId/columns', validateObjectId('boardId'), loadBoard, columnRoutes);

module.exports = router;
