import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { applyServerError } from '../../lib/serverErrors';
import { registerSchema } from './authSchemas';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import Button from '../../components/Button';

// Los mensajes del backend se dirigen al input correspondiente
const MATCHERS = [
  [/email/i, 'email'],
  [/contraseña/i, 'password'],
  [/nombre/i, 'name'],
];

export default function RegisterForm() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { name: '', email: '', password: '' } });

  const onSubmit = async (values) => {
    try {
      await registerUser(values);
      navigate('/boards', { replace: true });
    } catch (error) {
      applyServerError(error, setError, { matchers: MATCHERS });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormError message={errors.root?.server?.message} />
      <FormField label="Nombre" autoComplete="name" autoFocus {...register('name')} error={errors.name?.message} />
      <FormField label="Email" type="email" autoComplete="email" {...register('email')} error={errors.email?.message} />
      <FormField label="Contraseña" type="password" autoComplete="new-password" {...register('password')} error={errors.password?.message} />
      <Button type="submit" variant="primary" block loading={isSubmitting}>
        Crear cuenta
      </Button>
    </form>
  );
}
