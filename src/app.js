import express from 'express';
import authRoutes from './routes/authRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import { requireAuth } from './middlewares/requireAuth.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const origin = req.get('Origin');
  if (!origin) return next();
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Origen no permitido por CORS' });
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/boards', requireAuth, boardRoutes);

// Siempre al final: ruta inexistente y manejador global de errores
app.use(notFound);
app.use(errorHandler);

export default app;
