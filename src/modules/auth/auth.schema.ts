import { z } from 'zod';

export const RegisterBody = z.object({
  email: z.string().email(),
  name: z.string().min(2).optional(),
  password: z.string().min(6),
  role: z.enum(['PUBLISHER', 'SUBSCRIBER']),
});

export const LoginBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type RegisterBodyT = z.infer<typeof RegisterBody>;
export type LoginBodyT = z.infer<typeof LoginBody>;
