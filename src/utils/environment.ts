/**
 * Indicates if the application is running in a development or testing environment
 */
export const isDevOrTestEnv =
  process.env.NEXT_PUBLIC_TEST_ENV === 'e2e' ||
  process.env.NODE_ENV === 'development';
