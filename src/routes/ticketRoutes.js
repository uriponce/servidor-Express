import { Router } from 'express';
import { createTicket, updateTicket } from '../controllers/ticketController.js';
import { validateObjectId } from '../middlewares/validateObjectId.js';

// mergeParams: true permite ver :boardId y :columnId definidos en los routers padres
const router = Router({ mergeParams: true });

router.post('/', createTicket);
router.patch('/:ticketId', validateObjectId('ticketId'), updateTicket);

export default router;
