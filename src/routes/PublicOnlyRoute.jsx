import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Con sesión iniciada, /login y /register redirigen a donde el usuario quería ir (o a /boards)
export default function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const target = location.state?.from?.pathname || '/boards';
  return isAuthenticated ? <Navigate to={target} replace /> : <Outlet />;
}
