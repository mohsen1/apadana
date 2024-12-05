import dotenv from 'dotenv';
import _ from 'lodash';
import { z } from 'zod';

const schema = z.object({
  // Google Maps
  GOOGLE_MAPS_API_KEY: z.string(),

  // Database
  DATABASE_URL: z.string().url(),

  // Next
  VERCEL_URL: z.string(),
  NEXT_PUBLIC_DOMAIN: z.string().url(),

  // S3 Upload
  NEXT_PUBLIC_S3_UPLOAD_BUCKET: z.string(),
  NEXT_PUBLIC_S3_UPLOAD_REGION: z.string(),
  S3_UPLOAD_KEY: z.string(),
  S3_UPLOAD_SECRET: z.string(),

  // 3rd Party
  RESEND_API_KEY: z.string(),

  // Testing
  TEST_ENV: z.enum(['e2e', 'local']).optional(),
});

/**
 * Validates the environment variables.
 *
 * @throws Will throw an error if the environment variables are invalid.
 */
export const validateEnvironmentVariables = _.memoize(() => {
  dotenv.config();
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const messages = Object.entries(result.error.flatten().fieldErrors)
      .map(([key, value]) => `    ${key}: ${value}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${messages}`);
  }
});

type EnvironmentVariables = z.infer<typeof schema>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends EnvironmentVariables {}
  }
}
