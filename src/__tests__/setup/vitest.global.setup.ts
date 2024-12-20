import dotenv from 'dotenv';
import path from 'path';

export default async function globalSetup() {
  // Load test environment variables
  dotenv.config({ path: path.join(process.cwd(), 'config', 'test.env') });

  // Dynamically import the test container setup so the Prisma client is configured
  // by the test environment variables (DATABASE_URL)
  const { setupTestContainer } = await import(
    '@/__tests__/setup/test-container'
  );

  await setupTestContainer();
}
