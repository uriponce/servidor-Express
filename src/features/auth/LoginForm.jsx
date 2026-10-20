import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { applyServerError } from '../../lib/serverErrors';
import { loginSchema } from './authSchemas';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import Button from '../../components/Button';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/boards';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values) => {
    try {
      await login(values);
      navigate(redirectTo, { replace: true }); // navegación programática, solo tras el éxito
    } catch (error) {
      applyServerError(error, setError); // 401 → error general del formulario
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormError message={errors.root?.server?.message} />
      <FormField label="Email" type="email" autoComplete="email" autoFocus {...register('email')} error={errors.email?.message} />
      <FormField label="Contraseña" type="password" autoComplete="current-password" {...register('password')} error={errors.password?.message} />
      <Button type="submit" variant="primary" block loading={isSubmitting}>
        Iniciar sesión
      </Button>
    </form>
  );
}
