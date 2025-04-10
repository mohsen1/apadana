import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import Loading from '@/components/ui/loading';

import { getEmails, getUniqueEmails } from '@/app/local-inbox/action';
import { createLogger } from '@/utils/logger';

const logger = createLogger('local-inbox');

import { headers } from 'next/headers';

import { E2E_TESTING_SECRET_HEADER } from '@/lib/auth/constants';

import EmailsList from './EmailsList';

export const metadata = {
  title: 'Local Inbox',
};

export default async function EmailsPage(params: { searchParams: Promise<{ to?: string }> }) {
  const { get: getHeader } = await headers();
  const e2eTestingSecret = getHeader(E2E_TESTING_SECRET_HEADER);
  const isProdDeploy = process.env.VERCEL_ENV === 'production';

  if (e2eTestingSecret !== process.env.E2E_TESTING_SECRET && isProdDeploy) {
    logger.error('Visited local inbox page outside of e2e testing');
    redirect('/');
  }

  const searchParams = await params.searchParams;
  const toEmail = searchParams.to;
  const [emailsResult, uniqueEmailsResult] = await Promise.allSettled([
    getEmails(toEmail),
    getUniqueEmails(),
  ]);

  if (emailsResult.status === 'rejected') {
    return <div>{emailsResult.reason}</div>;
  }

  if (uniqueEmailsResult.status === 'rejected') {
    return <div>{uniqueEmailsResult.reason}</div>;
  }

  const emails = emailsResult.value ?? [];
  const uniqueEmails = uniqueEmailsResult.value ?? [];

  return (
    <Suspense fallback={<Loading />}>
      <EmailsList emails={emails} currentEmail={toEmail} uniqueEmails={uniqueEmails} />
    </Suspense>
  );
}
