import { Suspense } from 'react';

import { getEmails } from '@/app/local-inbox/action';

import EmailsList from './EmailsList';

export const metadata = {
  title: 'Local Inbox',
};

export default async function EmailsPage() {
  const result = await getEmails();

  if (result?.serverError) {
    return <div>{result.serverError.error}</div>;
  }

  const emails = result?.data ?? [];

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EmailsList emails={emails} />
    </Suspense>
  );
}
