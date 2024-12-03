import { z } from 'zod';
export const updateUserSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  imageUrl: z.string().url().optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
