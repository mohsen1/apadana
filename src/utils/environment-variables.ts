import dotenv from 'dotenv';
import _ from 'lodash';
import { z } from 'zod';

const schema = z.object({
  // Node Environment
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // Apple
  APPLE_CLIENT_ID: z.string(),
  APPLE_CLIENT_SECRET: z.string(),
  APPLE_TEAM_ID: z.string(),
  APPLE_KEY_ID: z.string(),
  APPLE_PRIVATE_KEY: z.string(),

  // Google Maps
  GOOGLE_MAPS_API_KEY: z.string(),

  // Database
  DATABASE_URL: z.string().url(),

  // Next
  VERCEL_URL: z.string(),

  // S3 Upload
  NEXT_PUBLIC_S3_UPLOAD_BUCKET: z.string(),
  NEXT_PUBLIC_S3_UPLOAD_REGION: z.string(),
  S3_UPLOAD_KEY: z.string(),
  S3_UPLOAD_SECRET: z.string(),

  // 3rd Party
  RESEND_API_KEY: z.string(),

  // Testing
  NEXT_PUBLIC_TEST_ENV: z.enum(['e2e', 'local']).optional(),

  // E2E
  E2E_TESTING_SECRET: z.string().min(20).max(60).optional(),
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
      .map(([key, value]) => `    ${key}: ${value?.join(', ')}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${messages}`);
  }
});

type EnvironmentVariables = z.infer<typeof schema>;

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends EnvironmentVariables {}
  }
}
