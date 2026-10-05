import { Router } from 'express';
import { createColumn, deleteColumn } from '../controllers/columnController.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';
import { parentCheck } from '../middlewares/parentCheck.js';
import ticketRoutes from './ticketRoutes.js';

const router = Router({ mergeParams: true });

router.post('/', createColumn);
router.delete('/:columnId', validateObjectId('columnId'), parentCheck('column'), deleteColumn);

// Ruta anidada: todo lo de tickets pasa primero por validar + verificar la columna
router.use('/:columnId/tickets', validateObjectId('columnId'), parentCheck('column'), ticketRoutes);

export default router;
