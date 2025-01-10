import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { isUsingLocalResend } from '@/lib/email/resend';

import Loading from '@/components/ui/loading';

import { getEmails, getUniqueEmails } from '@/app/local-inbox/action';
import { createLogger } from '@/utils/logger';

const logger = createLogger('local-inbox');

import { headers } from 'next/headers';

import EmailsList from './EmailsList';

export const metadata = {
  title: 'Local Inbox',
};

export default async function EmailsPage(params: { searchParams: Promise<{ to?: string }> }) {
  const { get } = await headers();
  const e2eTestingSecret = get('e2e-testing-secret');
  if (isUsingLocalResend(e2eTestingSecret)) {
    logger.error('Visited local inbox page outside of e2e testing');
    redirect('/');
  }

  const searchParams = await params.searchParams;
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
