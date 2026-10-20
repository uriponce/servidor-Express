import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Ingresá tu email').email('El email no es válido'),
  password: z.string().min(1, 'Ingresá tu contraseña'),
});

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Ingresá tu nombre').max(60, 'Máximo 60 caracteres'),
  email: z.string().trim().min(1, 'Ingresá tu email').email('El email no es válido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});
