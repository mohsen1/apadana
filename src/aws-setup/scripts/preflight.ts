import {
  GetGroupCommand,
  GetGroupPolicyCommand,
  GetPolicyCommand,
  GetPolicyVersionCommand,
  IAMClient,
  ListAttachedGroupPoliciesCommand,
  ListGroupPoliciesCommand,
} from '@aws-sdk/client-iam';
import { GetCallerIdentityCommand, STSClient } from '@aws-sdk/client-sts';
import { spawn } from 'child_process';
import { join } from 'path';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

import { DEPLOYER_PERMISSIONS } from '../constants';

const logger = createLogger(import.meta.filename);

const REQUIRED_PERMISSIONS = DEPLOYER_PERMISSIONS;

interface PolicyStatement {
  Effect: 'Allow' | 'Deny';
  Action: string | string[];
  Resource?: string | string[];
  Condition?: Record<string, Record<string, string | string[]>>;
}

interface PolicyDocument {
  Version: string;
  Statement: PolicyStatement[];
}

function decodePolicy(policyDocument: string): PolicyDocument {
  try {
    // First try parsing as is
    return JSON.parse(policyDocument) as PolicyDocument;
  } catch (err) {
    assertError(err);
    try {
      // If that fails, try URL decoding first
      return JSON.parse(decodeURIComponent(policyDocument)) as PolicyDocument;
    } catch (decodeErr) {
      logger.error('Failed to decode policy document:', policyDocument);
      throw decodeErr;
    }
  }
}

async function createDeployer(environment: string) {
  const scriptPath = join(import.meta.dirname, 'create-deployer.ts');
  const tsxPath = join(process.cwd(), 'node_modules', '.bin', 'tsx');

  return new Promise<void>((resolve, reject) => {
    const child = spawn(tsxPath, [scriptPath], {
      env: { ...process.env, AWS_DEPLOYMENT_STACK_ENV: environment },
      stdio: 'inherit',
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`create-deployer.ts exited with code ${code}`));
      }
    });
  });
}

async function validateDeployer(environment: string) {
  const iam = new IAMClient({});
  const groupName = `ap-deployer-group-${environment}`;

  logger.info('Starting deployer validation...');

  try {
    // Check if group exists
    try {
      await iam.send(new GetGroupCommand({ GroupName: groupName }));
      logger.info(`✓ Deployer group ${groupName} exists`);
    } catch (error) {
      assertError(error);
      if (error.name === 'NoSuchEntity') {
        logger.info(`Creating deployer group ${groupName}...`);
        await createDeployer(environment);
        logger.info(`✓ Created deployer group ${groupName}`);
      } else {
        throw error;
      }
    }

    // Get all permissions from both attached and inline policies
    const foundPermissions = new Set<string>();

    // Check attached policies
    const { AttachedPolicies } = await iam.send(
      new ListAttachedGroupPoliciesCommand({ GroupName: groupName }),
    );

    if (AttachedPolicies?.length) {
      for (const policy of AttachedPolicies) {
        if (!policy.PolicyArn) continue;

        const { Policy } = await iam.send(new GetPolicyCommand({ PolicyArn: policy.PolicyArn }));
        if (!Policy?.Arn || !Policy.DefaultVersionId) continue;

        const { PolicyVersion } = await iam.send(
          new GetPolicyVersionCommand({
            PolicyArn: Policy.Arn,
            VersionId: Policy.DefaultVersionId,
          }),
        );

        if (!PolicyVersion?.Document) continue;

        const document =
          typeof PolicyVersion.Document === 'string'
            ? decodePolicy(PolicyVersion.Document)
            : (PolicyVersion.Document as PolicyDocument);

        // Extract permissions from policy
        document.Statement.forEach((statement) => {
          if (statement.Effect === 'Allow') {
            const actions = Array.isArray(statement.Action) ? statement.Action : [statement.Action];
            actions.forEach((action) => foundPermissions.add(action));
          }
        });
      }
    }

    // Check inline policies
    const { PolicyNames } = await iam.send(new ListGroupPoliciesCommand({ GroupName: groupName }));
    if (PolicyNames?.length) {
      for (const policyName of PolicyNames) {
        const { PolicyDocument } = await iam.send(
          new GetGroupPolicyCommand({
            GroupName: groupName,
            PolicyName: policyName,
          }),
        );

        if (!PolicyDocument) continue;

        const document =
          typeof PolicyDocument === 'string'
            ? decodePolicy(PolicyDocument)
            : (PolicyDocument as PolicyDocument);

        // Extract permissions from policy
        document.Statement.forEach((statement) => {
          if (statement.Effect === 'Allow') {
            const actions = Array.isArray(statement.Action) ? statement.Action : [statement.Action];
            actions.forEach((action) => foundPermissions.add(action));
          }
        });
      }
    }

    // Validate required permissions
    const missingPermissions = REQUIRED_PERMISSIONS.filter((perm) => {
      // Handle wildcards in both required and found permissions
      return ![...foundPermissions].some((found) => {
        const reqParts = perm.split(':');
        const foundParts = found.split(':');

        if (foundParts[0] !== reqParts[0]) return false;
        if (foundParts[1] === '*') return true;
        if (reqParts[1] === '*') return true;
        return foundParts[1] === reqParts[1];
      });
    });

    if (missingPermissions.length > 0) {
      logger.error('✗ Missing required permissions:', missingPermissions);
      throw new Error(`Missing required permissions: ${missingPermissions.join(', ')}`);
    }

    logger.info('✓ All required permissions are present');
  } catch (error) {
    assertError(error);
    logger.error('Deployer validation failed:', error);
    throw error;
  }
}

async function showVercelInstructions(environment: string) {
  logger.info('\nTo add AWS credentials to Vercel:');
  logger.info(`1. Run: vercel env add AWS_ACCESS_KEY_ID ${environment}`);
  logger.info(`2. Run: vercel env add AWS_SECRET_ACCESS_KEY ${environment}`);
  logger.info('3. Deploy your project to apply the changes');
}

async function runPreflight() {
  try {
    // Check AWS credentials
    logger.info('Checking AWS credentials...');
    const stsClient = new STSClient({});
    const identity = await stsClient.send(new GetCallerIdentityCommand({}));
    logger.info('AWS credentials valid:', identity);

    // Validate deployer permissions
    const environment =
      process.env.AWS_DEPLOYMENT_STACK_ENV || process.env.VERCEL_ENV || 'development';
    logger.info(`Validating deployer permissions for ${environment} environment...`);
    await validateDeployer(environment);

    // Always show Vercel instructions
    await showVercelInstructions(environment);

    logger.info('✓ All preflight checks passed.');
    process.exit(0);
  } catch (error) {
    assertError(error);
    logger.error('✗ Preflight checks failed:', error);
    process.exit(1);
  }
}

void runPreflight();
