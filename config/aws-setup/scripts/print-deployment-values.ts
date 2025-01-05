import {
  CloudFormationClient,
  DescribeStacksCommand
} from '@aws-sdk/client-cloudformation';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

(async () => {
  const env = process.env.AWS_DEPLOYMENT_STACK_ENV || 'development';
  const stackNames = [
    `MemoryDbStack-${env}`,
    `RdsStack-${env}`,
    `S3Stack-${env}`
  ];

  const cfClient = new CloudFormationClient({});
  const secretsClient = new SecretsManagerClient({});

  let redisUrl = '';
  let dbUrl = '';
  let s3Bucket = '';

  for (const stackName of stackNames) {
    try {
      const res = await cfClient.send(new DescribeStacksCommand({ StackName: stackName }));
      const outputs = res.Stacks?.[0]?.Outputs || [];

      for (const out of outputs) {
        const key = out.OutputKey;
        const val = out.OutputValue;

        // Check for Redis
        if (key === 'RedisEndpoint' && val) {
          redisUrl = `rediss://${val}:6379`;
        }

        // Check for RDS
        if (key === 'RdsEndpoint' && val) {
          const host = val;
          const secretKey = outputs.find(o => o.OutputKey === 'RdsSecretName')?.OutputValue || '';
          if (secretKey) {
            const secretRes = await secretsClient.send(
              new GetSecretValueCommand({ SecretId: secretKey })
            );
            if (secretRes.SecretString) {
              const secretJson = JSON.parse(secretRes.SecretString);
              const username = secretJson.username;
              const password = secretJson.password;
              dbUrl = `postgresql://${username}:${password}@${host}:5432/ap_db`;
            }
          }
        }

        // Check for S3
        if (key === 'BucketName' && val) {
          s3Bucket = val;
        }
      }
    } catch (err) {
      console.error(`Error describing stack ${stackName}:`, err);
    }
  }

  console.log(`REDIS_URL=${redisUrl}`);
  console.log(`DATABASE_URL=${dbUrl}`);
  console.log(`AWS_S3_BUCKET_NAME=${s3Bucket}`);
})(); 