import { Router } from 'express';
import { createBoard, getBoard } from '../controllers/boardController.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';
import { parentCheck } from '../middlewares/parentCheck.js';
import columnRoutes from './columnRoutes.js';

const router = Router();

router.post('/', createBoard);
router.get('/:boardId', validateObjectId('boardId'), parentCheck('board'), getBoard);

// Ruta anidada: todo lo de columnas pasa primero por validar + verificar el tablero
router.use('/:boardId/columns', validateObjectId('boardId'), parentCheck('board'), columnRoutes);

export default router;
