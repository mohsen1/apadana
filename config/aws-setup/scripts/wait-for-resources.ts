import { CloudFormationClient, DescribeStacksCommand, Stack } from '@aws-sdk/client-cloudformation';
import { RDSClient, DescribeDBInstancesCommand } from '@aws-sdk/client-rds';
import { MemoryDBClient, DescribeClustersCommand } from '@aws-sdk/client-memorydb';

const STACK_PREFIX = 'apadana';
const TIMEOUT_MINUTES = 30;
const POLL_INTERVAL_SECONDS = 30;

async function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

async function waitForStacks(environment: string) {
  const cfn = new CloudFormationClient({});
  const startTime = Date.now();

  while (Date.now() - startTime < TIMEOUT_MINUTES * 60 * 1000) {
    const { Stacks } = await cfn.send(new DescribeStacksCommand({}));
    const envStacks = Stacks?.filter(
      (s) => s.StackName.includes(environment) && s.StackName.startsWith(STACK_PREFIX)
    );

    if (!envStacks?.length) {
      console.log('No stacks found for environment:', environment);
      return false;
    }

    const inProgress = envStacks.filter((s) => s.StackStatus.endsWith('_IN_PROGRESS'));
    if (!inProgress.length) {
      const failed = envStacks.filter((s) => s.StackStatus.endsWith('_FAILED'));
      if (failed.length) {
        console.error('Some stacks failed:', failed.map((s) => s.StackName).join(', '));
        return false;
      }
      console.log('All stacks are ready!');
      return true;
    }

    console.log(
      'Stacks still in progress:',
      inProgress.map((s) => `${s.StackName} (${s.StackStatus})`).join(', ')
    );
    await sleep(POLL_INTERVAL_SECONDS);
  }

  console.error('Timeout waiting for stacks');
  return false;
}

async function waitForRDS(environment: string) {
  const rds = new RDSClient({});
  const startTime = Date.now();

  while (Date.now() - startTime < TIMEOUT_MINUTES * 60 * 1000) {
    const { DBInstances } = await rds.send(new DescribeDBInstancesCommand({}));
    const instance = DBInstances?.find((db) => db.DBInstanceIdentifier === `ap-rds-${environment}`);

    if (!instance) {
      console.log('RDS instance not found');
      return false;
    }

    if (instance.DBInstanceStatus === 'available') {
      console.log('RDS is ready!');
      return true;
    }

    console.log('RDS status:', instance.DBInstanceStatus);
    await sleep(POLL_INTERVAL_SECONDS);
  }

  console.error('Timeout waiting for RDS');
  return false;
}

async function waitForMemoryDB(environment: string) {
  const memorydb = new MemoryDBClient({});
  const startTime = Date.now();

  while (Date.now() - startTime < TIMEOUT_MINUTES * 60 * 1000) {
    const { Clusters } = await memorydb.send(new DescribeClustersCommand({}));
    const cluster = Clusters?.find((c) => c.Name === `apadana-memorydb-${environment}`);

    if (!cluster) {
      console.log('MemoryDB cluster not found');
      return false;
    }

    if (cluster.Status === 'available') {
      console.log('MemoryDB is ready!');
      return true;
    }

    console.log('MemoryDB status:', cluster.Status);
    await sleep(POLL_INTERVAL_SECONDS);
  }

  console.error('Timeout waiting for MemoryDB');
  return false;
}

async function main() {
  const environment = process.env.AWS_DEPLOYMENT_STACK_ENV;
  if (!environment) {
    console.error('AWS_DEPLOYMENT_STACK_ENV is required');
    process.exit(1);
  }

  console.log(`Waiting for ${environment} resources to be ready...`);
  
  const results = await Promise.all([
    waitForStacks(environment),
    waitForRDS(environment),
    waitForMemoryDB(environment)
  ]);

  if (results.every(Boolean)) {
    console.log('All resources are ready!');
    process.exit(0);
  } else {
    console.error('Some resources failed to become ready');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
}); 