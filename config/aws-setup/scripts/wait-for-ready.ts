import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';

interface CloudFormationError {
  name: string;
  message: string;
}

(async () => {
  const env = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';
  const stackNames = [
    `IamStack-${env}`,
    `SharedNetworkStack-${env}`,
    `MemoryDbStack-${env}`,
    `RdsStack-${env}`,
    `S3Stack-${env}`
  ];

  const client = new CloudFormationClient({});

  for (const stackName of stackNames) {
    let isReady = false;
    console.log(`Waiting for stack: ${stackName}`);

    while (!isReady) {
      try {
        const res = await client.send(new DescribeStacksCommand({ StackName: stackName }));
        const status = res.Stacks?.[0]?.StackStatus ?? 'UNKNOWN';
        console.log(`${stackName} => ${status}`);

        // Check if stable/successful
        if (status.endsWith('_COMPLETE') && !status.startsWith('ROLLBACK')) {
          isReady = true;
        } else if (status.endsWith('_FAILED') || status.includes('ROLLBACK')) {
          console.error(`Stack ${stackName} failed with status: ${status}`);
          process.exit(1);
        } else {
          // Sleep 10 seconds, then check again
          await new Promise((resolve) => setTimeout(resolve, 10_000));
        }
      } catch (error) {
        const cfError = error as CloudFormationError;
        if (cfError.name === 'ValidationError' && cfError.message.includes('does not exist')) {
          console.log(`${stackName} => NOT_CREATED_YET`);
          await new Promise((resolve) => setTimeout(resolve, 10000));
        } else {
          throw error;
        }
      }
    }

    console.log(`Stack ${stackName} is ready`);
  }

  console.log('All stacks are ready.');
  process.exit(0);
})(); 