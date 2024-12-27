'use server';

import { z } from 'zod';

import prisma from '@/lib/prisma/client';
import { actionClient } from '@/lib/safe-action';

export const getEarlySignups = actionClient
  .schema(
    z.object({
      skip: z.number(),
      take: z.number(),
    }),
  )
  .action(async ({ parsedInput: { skip, take } }) => {
    const [earlySignups, total] = await Promise.all([
      prisma.earlyAccessSignup.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.earlyAccessSignup.count(),
    ]);

    return {
      earlySignups,
      pagination: {
        total,
        pages: Math.ceil(total / take),
        take,
        skip,
      },
    };
  });
