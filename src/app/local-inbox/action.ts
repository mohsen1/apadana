'use server';
import { z } from 'zod';

import prisma from '@/lib/prisma/client';
import { actionClient } from '@/lib/safe-action';

import { assertError } from '@/utils';

export async function getUniqueEmails() {
  try {
    const uniqueEmails = await prisma.localEmail.findMany({
      select: {
        to: true,
      },
      distinct: ['to'],
      orderBy: {
        to: 'asc',
      },
    });

    return { data: uniqueEmails.map((email) => email.to) };
  } catch (error) {
    assertError(error);
    return {
      serverError: {
        error: 'Failed to fetch unique emails',
      },
    };
  }
}

export async function getEmails(toEmail?: string) {
  try {
    const where = toEmail ? { to: toEmail } : {};

    const emails = await prisma.localEmail.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return { data: emails };
  } catch (error) {
    assertError(error);
    return {
      serverError: {
        error: 'Failed to fetch emails',
      },
    };
  }
}

export const deleteAllEmails = actionClient.schema(z.void()).action(async () => {
  await prisma.localEmail.deleteMany({
    where: {},
  });
  return { success: true };
});
