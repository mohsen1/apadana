import { z } from 'zod';

import prisma from '@/lib/prisma/client';
import { actionClient } from '@/lib/safe-action';
import { localEmailSchema } from '@/lib/schema';

export const getEmails = actionClient.outputSchema(z.array(localEmailSchema)).action(async () => {
  const emails = await prisma.localEmail.findMany();
  return emails;
});
