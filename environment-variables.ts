import { z } from 'zod';

const schema = z.object({
  CLERK_SECRET_KEY: z.string(),
  GOOGLE_MAPS_API_KEY: z.string(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  UPLOADTHING_APP_ID: z.string(),
  UPLOADTHING_SECRET: z.string(),
  UPLOADTHING_TOKEN: z.string(),
  WEBHOOK_SECRET: z.string(),
  POSTGRES_DATABASE_URL: z.string().url(),
});

/**
 * Validates the environment variables.
 *
 * @throws Will throw an error if the environment variables are invalid.
 */
export function validateEnvironmentVariables() {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const messages = Object.entries(result.error.flatten().fieldErrors)
      .map(([key, value]) => `    ${key}: ${value}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${messages}`);
  }
}

type EnvironmentVariables = z.infer<typeof schema>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends EnvironmentVariables {}
  }
}
