import { Link } from 'react-router-dom';
import LoginForm from '../features/auth/LoginForm';
import AuthShell from '../features/auth/AuthShell';

export default function LoginPage() {
  const usingMocks = import.meta.env.VITE_USE_MOCKS === 'true';
  return (
    <AuthShell title="Iniciar sesión" subtitle="Accedé a tus tableros">
      {usingMocks && <p className="hint">Modo demo (mocks) — demo@kanban.dev / demo1234</p>}
      <LoginForm />
      <p className="auth-card__foot">
        ¿No tenés cuenta? <Link to="/register">Registrate</Link>
      </p>
    </AuthShell>
  );
}
