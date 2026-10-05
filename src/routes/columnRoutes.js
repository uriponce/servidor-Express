const express = require('express');
const { createColumn, deleteColumn } = require('../controllers/columnController');
const { validateObjectId } = require('../middlewares/validateObjectId');
const loadColumn = require('../middlewares/loadColumn');
const ticketRoutes = require('./ticketRoutes');

const router = express.Router({ mergeParams: true });

router.post('/', createColumn);
router.delete('/:columnId', validateObjectId('columnId'), loadColumn, deleteColumn);

// Ruta anidada: todo lo de tickets pasa primero por validar + verificar la columna
router.use('/:columnId/tickets', validateObjectId('columnId'), loadColumn, ticketRoutes);

module.exports = router;
