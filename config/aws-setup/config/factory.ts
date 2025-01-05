import { EnvConfig } from './types';

export function getEnvConfig(env: string): EnvConfig {
  if (!process.env.CDK_DEFAULT_ACCOUNT) {
    throw new Error('CDK_DEFAULT_ACCOUNT is not set');
  }
  const region = process.env.AWS_REGION || 'us-east-1';
  switch (env) {
    case 'production':
      return {
        environment: 'production',
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region,
        rdsInstanceType: 't3.medium',
        rdsAllocatedStorage: 20,
        rdsMaxAllocatedStorage: 100,
        memoryDbNodeType: 'db.t4g.medium',
        memoryDbNumReplicas: 1,
        memoryDbShardCount: 1,
        backupRetentionDays: 7,
        publicDbAccess: true
      };
    case 'preview':
      return {
        environment: 'preview',
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region,
        rdsInstanceType: 't3.micro',
        rdsAllocatedStorage: 10,
        rdsMaxAllocatedStorage: 50,
        memoryDbNodeType: 'db.t4g.small',
        memoryDbNumReplicas: 0,
        memoryDbShardCount: 1,
        backupRetentionDays: 1,
        publicDbAccess: true
      };
    default:
      return {
        environment: 'development',
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region,
        rdsInstanceType: 't3.medium',
        rdsAllocatedStorage: 20,
        rdsMaxAllocatedStorage: 50,
        memoryDbNodeType: 'db.t4g.small',
        memoryDbNumReplicas: 0,
        memoryDbShardCount: 1,
        backupRetentionDays: 1,
        publicDbAccess: true
      };
  }
} 