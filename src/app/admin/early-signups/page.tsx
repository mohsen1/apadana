import prisma from '@/lib/prisma/client';

import { EarlySignupList } from './EarlySignupList';

export default async function EarlySignupsPage() {
  const take = 10;
  const skip = 0;

  const [earlySignups, total] = await Promise.all([
    prisma.earlyAccessSignup.findMany({
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.earlyAccessSignup.count(),
  ]);

  return (
    <EarlySignupList
      earlySignups={earlySignups}
      pagination={{
        total,
        pages: Math.ceil(total / take),
        take,
        skip,
      }}
    />
  );
}
