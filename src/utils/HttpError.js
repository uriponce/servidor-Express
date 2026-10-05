// Error con código HTTP propio, para lanzarlo desde middlewares y controladores
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = HttpError;
