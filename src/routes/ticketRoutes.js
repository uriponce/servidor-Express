const express = require('express');
const { createTicket, updateTicket } = require('../controllers/ticketController');
const { validateObjectId } = require('../middlewares/validateObjectId');

// mergeParams: true permite ver :boardId y :columnId definidos en los routers padres
const router = express.Router({ mergeParams: true });

router.post('/', createTicket);
router.patch('/:ticketId', validateObjectId('ticketId'), updateTicket);

module.exports = router;
