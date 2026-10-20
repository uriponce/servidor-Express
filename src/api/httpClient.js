import axios from 'axios';
import { ApiError } from './ApiError';
import { createMockAdapter } from './mock/mockAdapter';

export const TOKEN_KEY = 'kanban-token';

// La URL base se lee SOLO de la variable de entorno de Vite
const baseURL = import.meta.env.VITE_API_URL;
const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export const httpClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  ...(useMocks ? { adapter: createMockAdapter() } : {}),
});

// Adjunta el token a cada petición
httpClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    /* localStorage no disponible */
  }
  return config;
});

// Quien maneja la sesión (AuthProvider) registra acá qué hacer ante un 401
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

// Normaliza errores a ApiError y propaga la excepción
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new ApiError(0, 'No se pudo conectar con el servidor'));
    }
    const { status, data } = error.response;
    const isAuthEndpoint = /\/auth\/(login|register)$/.test(error.config?.url ?? '');
    // Token vencido/ inválido en una ruta protegida → cerrar sesión
    if (status === 401 && !isAuthEndpoint && onUnauthorized) onUnauthorized();
    return Promise.reject(new ApiError(status, data?.error || 'Error inesperado del servidor'));
  }
);
