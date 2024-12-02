import prisma from '@/lib/prisma/client';

import EmailsList from './EmailsList';

export const metadata = {
  title: 'Local Inbox',
};

export default async function EmailsPage() {
  const emails = await prisma.localEmail.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <EmailsList emails={emails} />;
}
