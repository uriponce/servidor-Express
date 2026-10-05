import express from 'express';
import boardRoutes from './routes/boardRoutes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/boards', boardRoutes);

// Siempre al final: ruta inexistente y manejador global de errores
app.use(notFound);
app.use(errorHandler);

export default app;
