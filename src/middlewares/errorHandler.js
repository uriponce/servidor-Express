// Ruta que no existe
function notFound(req, res) {
  res.status(404).json({ error: 'Ruta no encontrada' });
}

// Manejador global: todos los errores terminan acá y salen como { error: "mensaje" }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Errores lanzados a propósito (HttpError)
  if (err.status && err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message });
  }

  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }

  // Falla de validación del schema (ej. falta el título)
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((e) => e.message).join('. ');
    return res.status(400).json({ error: message });
  }

  // Valor con tipo/formato inválido (ej. ID mal formado que se coló)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Valor inválido para ${err.path}` });
  }

  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = { notFound, errorHandler };
