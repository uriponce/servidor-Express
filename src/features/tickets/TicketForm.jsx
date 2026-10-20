import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applyServerError } from '../../lib/serverErrors';
import { ticketSchema } from './ticketSchema';
import FormField from '../../components/FormField';
import FormError from '../../components/FormError';
import Button from '../../components/Button';

export default function TicketForm({ defaultValues = { title: '', description: '' }, submitLabel, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(ticketSchema), defaultValues });

  const submit = async (values) => {
    try {
      await onSubmit(values);
    } catch (error) {
      applyServerError(error, setError, {
        matchers: [[/descripci/i, 'description']],
        defaultField: 'title',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <FormError message={errors.root?.server?.message} />
      <FormField label="Título" autoFocus {...register('title')} error={errors.title?.message} />
      <FormField label="Descripción (opcional)" multiline {...register('description')} error={errors.description?.message} />
      <div className="form-actions">
        <Button onClick={onCancel} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>{submitLabel}</Button>
      </div>
    </form>
  );
}
