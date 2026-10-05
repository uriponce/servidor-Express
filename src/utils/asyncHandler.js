// Express 4 no captura errores de funciones async por sí solo.
// Este envoltorio los manda al manejador global de errores con next(err).
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
