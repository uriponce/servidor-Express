// Error normalizado: toda la app trata los fallos HTTP con esta forma
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status; // 0 = sin respuesta (red caída / CORS)
  }
}
