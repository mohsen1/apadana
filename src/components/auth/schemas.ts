import { z } from 'zod';

const devPasswordSchema = z.string().min(1, 'Password is required');
const prodPasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be less than 100 characters');

export const passwordSchema =
  process.env.NODE_ENV === 'development' ? devPasswordSchema : prodPasswordSchema;
