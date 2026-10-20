import { z } from 'zod';

export const boardSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(100, 'Máximo 100 caracteres'),
  description: z.string().trim(),
});
