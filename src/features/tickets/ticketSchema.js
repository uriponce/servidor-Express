import { z } from 'zod';

export const ticketSchema = z.object({
  title: z.string().trim().min(1, 'El título es obligatorio').max(150, 'Máximo 150 caracteres'),
  description: z.string().trim(),
});
