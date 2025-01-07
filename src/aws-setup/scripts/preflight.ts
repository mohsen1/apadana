import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';

import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

(async () => {
  const stsClient = new STSClient({});
  const identity = await stsClient.send(new GetCallerIdentityCommand({}));
  logger.info('Caller identity:', identity);
  logger.info('Preflight checks passed.');
  process.exit(0);
})();
