import { z } from 'zod';

import prisma from '@/lib/prisma/client';
import { actionClient } from '@/lib/safe-action';
import { LocalEmailSchema } from '@/lib/schema';

export const getEmails = actionClient.outputSchema(z.array(LocalEmailSchema)).action(async () => {
  const emails = await prisma.localEmail.findMany();
  return emails;
});
