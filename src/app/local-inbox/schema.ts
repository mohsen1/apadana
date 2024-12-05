import { z } from 'zod';

export const localEmailSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  subject: z.string(),
  html: z.string(),
});
