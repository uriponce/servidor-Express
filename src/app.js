const express = require('express');
const boardRoutes = require('./routes/boardRoutes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/boards', boardRoutes);

// Siempre al final: ruta inexistente y manejador global de errores
app.use(notFound);
app.use(errorHandler);

module.exports = app;
