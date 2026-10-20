import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '../../api/authService';
import { setUnauthorizedHandler, TOKEN_KEY } from '../../api/httpClient';

export const AuthContext = createContext(null);
const USER_KEY = 'kanban-user';

const readSession = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const user = JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    return token && user ? { token, user } : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
};

// Estado de sesión (token + usuario) con Context API
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [session, setSession] = useState(readSession);

  const saveSession = useCallback(({ token, user }) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      /* sin persistencia */
    }
    setSession({ token, user });
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } catch {
      /* noop */
    }
    queryClient.clear(); // no dejar datos del usuario anterior en caché
    setSession({ token: null, user: null });
  }, [queryClient]);

  const login = useCallback(async (credentials) => saveSession(await authService.login(credentials)), [saveSession]);
  const register = useCallback(async (data) => saveSession(await authService.register(data)), [saveSession]);

  // Token vencido o inválido (401 en una ruta protegida) → cerrar sesión
  useEffect(() => {
    setUnauthorizedHandler(() => {
      toast.error('Tu sesión expiró. Iniciá sesión de nuevo.');
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const value = useMemo(
    () => ({ user: session.user, isAuthenticated: Boolean(session.token), login, register, logout }),
    [session, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
