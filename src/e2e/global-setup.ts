import { FullConfig } from '@playwright/test';
import _ from 'lodash';

import { BuildChecker } from '@/e2e/utils/build-checker';

async function globalSetup(_config: FullConfig) {
  // When running locally, we need to make sure we are testing the latest build
  if (!process.env.CI && process.env.BASE_URL === 'https://prod.apadana.localhost') {
    const buildChecker = new BuildChecker();
    await buildChecker.checkAndRebuildIfNeeded();
  }
}

export default globalSetup;
