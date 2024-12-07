import { setupTestContainer } from '@/__tests__/setup/test-container';

export default async function globalSetup() {
  await setupTestContainer();
}
