'use server';
import { z } from 'zod';

import prisma from '@/lib/prisma/client';
import { actionClient } from '@/lib/safe-action';

export async function getUniqueEmails() {
  const uniqueEmails = await prisma.localEmail.findMany({
    select: {
      to: true,
    },
    distinct: ['to'],
    orderBy: {
      to: 'asc',
    },
  });

  return uniqueEmails.map((email) => email.to);
}

export async function getEmails(toEmail?: string) {
  const where = toEmail ? { to: toEmail } : {};

  const emails = await prisma.localEmail.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return emails;
}

export const deleteAllEmails = actionClient.schema(z.void()).action(async () => {
  await prisma.localEmail.deleteMany({
    where: {},
  });
  return { success: true };
});
