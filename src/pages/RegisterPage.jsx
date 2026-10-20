import { Link } from 'react-router-dom';
import RegisterForm from '../features/auth/RegisterForm';
import AuthShell from '../features/auth/AuthShell';

export default function RegisterPage() {
  return (
    <AuthShell title="Crear cuenta" subtitle="Empezá a organizar tus tableros">
      <RegisterForm />
      <p className="auth-card__foot">
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </AuthShell>
  );
}
