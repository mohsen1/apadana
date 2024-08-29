import Head from 'next/head';
import * as React from 'react';

import { prisma } from '@/lib/prisma/client';

export default async function HomePage() {
  const userCount = await prisma.user.count();
  return (
    <main>
      <Head>
        <title>Make your own listing website!</title>
      </Head>
      <section>
        number of users in the database:
        {userCount}
      </section>
    </main>
  );
}
