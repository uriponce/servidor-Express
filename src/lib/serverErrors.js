import { ApiError } from '../api/ApiError';

// Traduce un error del backend a un error de formulario, sin recargar la página.
//  - matchers: [[/regex del mensaje/, 'campo']] para dirigir el error a un input concreto
//  - defaultField: campo por defecto para errores 4xx
//  - errores de red / 5xx / 401 sin campo → error general (errors.root.server)
export function applyServerError(error, setError, { matchers = [], defaultField } = {}) {
  const message = error?.message || 'Ocurrió un error inesperado';
  const isClientError = error instanceof ApiError && error.status >= 400 && error.status < 500;

  if (isClientError && error.status !== 401) {
    const hit = matchers.find(([regex]) => regex.test(message));
    const field = hit ? hit[1] : defaultField;
    if (field) {
      setError(field, { type: 'server', message }, { shouldFocus: true });
      return;
    }
  }
  setError('root.server', { type: 'server', message });
}
