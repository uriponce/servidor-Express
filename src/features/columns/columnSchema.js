import { z } from 'zod';

export const columnSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(100, 'Máximo 100 caracteres'),
});
