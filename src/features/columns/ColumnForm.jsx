import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyServerError } from '../../lib/serverErrors';
import { columnSchema } from './columnSchema';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import Button from '../../components/Button';

// Formulario compacto para agregar una columna al final del tablero
export default function ColumnForm({ onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(columnSchema), defaultValues: { title: '' } });

  const submit = async (values) => {
    try {
      await onSubmit(values);
      reset();
    } catch (error) {
      applyServerError(error, setError, { defaultField: 'title' });
    }
  };

  return (
    <form className="inline-form" onSubmit={handleSubmit(submit)} noValidate>
      <FormError message={errors.root?.server?.message} />
      <FormField label="Título de la columna" autoFocus {...register('title')} error={errors.title?.message} />
      <div className="form-actions">
        <Button size="sm" onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button size="sm" type="submit" variant="primary" loading={isSubmitting}>Agregar</Button>
      </div>
    </form>
  );
}
