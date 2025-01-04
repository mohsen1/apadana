import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { isUsingLocalResend } from '@/lib/email/resend';

import Loading from '@/components/ui/loading';

import { getEmails, getUniqueEmails } from '@/app/local-inbox/action';

import EmailsList from './EmailsList';

export const metadata = {
  title: 'Local Inbox',
};

export default async function EmailsPage({ searchParams }: { searchParams: { to?: string } }) {
  if (!isUsingLocalResend) {
    redirect('/');
  }

  const toEmail = searchParams.to;
  const [emailsResult, uniqueEmailsResult] = await Promise.all([
    getEmails(toEmail),
    getUniqueEmails(),
  ]);

  if (emailsResult?.serverError) {
    return <div>{emailsResult.serverError.error}</div>;
  }

  const emails = emailsResult?.data ?? [];
  const uniqueEmails = uniqueEmailsResult?.data ?? [];

  return (
    <Suspense fallback={<Loading />}>
      <EmailsList emails={emails} currentEmail={toEmail} uniqueEmails={uniqueEmails} />
    </Suspense>
  );
}
