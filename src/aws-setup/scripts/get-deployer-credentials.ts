/* eslint-disable no-console */
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(import.meta.filename);

async function getDeployerCredentials(environment: string) {
  const secretsManager = new SecretsManager({});
  const secretName = `ap-deployer-${environment}-access-key`;

  try {
    logger.info(`Fetching deployer credentials for environment: ${environment}`);
    const { SecretString } = await secretsManager.getSecretValue({ SecretId: secretName });

    if (!SecretString) {
      throw new Error(`No credentials found for environment: ${environment}`);
    }

    const credentials = JSON.parse(SecretString) as {
      AccessKeyId: string;
      SecretAccessKey: string;
    };

    // Print in a format that can be easily copied to shell
    const awsCredentialsPath = path.join(os.homedir(), '.aws', 'credentials');

    fs.appendFileSync(
      awsCredentialsPath,
      [
        '',
        '',
        '',
        `# Added by deployer-credentials-script on ${new Date().toISOString()}`,
        `[ap-deployer-${environment}]`,
        `aws_access_key_id = ${credentials.AccessKeyId}`,
        `aws_secret_access_key = ${credentials.SecretAccessKey}`,
      ].join('\n'),
    );

    console.info(`Credentials written to ${awsCredentialsPath}. Update Vercel:`);
    console.info('\n'.repeat(2));
    console.info(`AWS_ACCESS_KEY_ID=${credentials.AccessKeyId}`);
    console.info(`vercel env add AWS_ACCESS_KEY_ID ${environment}`);
    console.info('\n'.repeat(2));
    console.info(`AWS_SECRET_ACCESS_KEY=${credentials.SecretAccessKey}`);
    console.info(`vercel env add AWS_SECRET_ACCESS_KEY ${environment}`);
    console.info('\n'.repeat(2));
  } catch (error) {
    assertError(error);
    if (error.name === 'ResourceNotFoundException') {
      logger.error(`No deployer credentials found for environment: ${environment}`);
    } else {
      logger.error('Failed to fetch deployer credentials:', error);
    }
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const environment = args[0] || process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';

if (!['development', 'preview', 'production'].includes(environment)) {
  logger.error(
    `Invalid environment: ${environment}. Must be one of: development, preview, production`,
  );
  process.exit(1);
}

void getDeployerCredentials(environment);
