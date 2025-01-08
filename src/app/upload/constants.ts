export const shouldUseFakeUploads =
  process.env.NEXT_PUBLIC_TEST_ENV === 'e2e' &&
  !process.env.VERCEL_URL?.includes('apadana.app') &&
  !process.env.VERCEL_URL?.includes('vercel.app');
