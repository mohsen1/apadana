import { EnvConfig } from './types';

export function getEnvConfig(env: string): EnvConfig {
  const region = process.env.AWS_REGION || 'us-east-1';
  switch (env) {
    case 'production':
      return {
        environment: 'production',
        region,
        rdsInstanceType: 't3.micro',
        rdsAllocatedStorage: 20,
        rdsMaxAllocatedStorage: 100,
        redisNodeType: 'cache.t4g.micro',
        redisNumReplicas: 0,
        redisShardCount: 1,
        backupRetentionDays: 1,
        publicDbAccess: true,
      };
    case 'preview':
      return {
        environment: 'preview',
        region,
        rdsInstanceType: 't3.micro',
        rdsAllocatedStorage: 20,
        rdsMaxAllocatedStorage: 100,
        redisNodeType: 'cache.t4g.micro',
        redisNumReplicas: 0,
        redisShardCount: 1,
        backupRetentionDays: 1,
        publicDbAccess: true,
      };
    default:
      return {
        environment: 'development',
        region,
        rdsInstanceType: 't3.micro',
        rdsAllocatedStorage: 20,
        rdsMaxAllocatedStorage: 100,
        redisNodeType: 'cache.t4g.micro',
        redisNumReplicas: 0,
        redisShardCount: 1,
        backupRetentionDays: 1,
        publicDbAccess: true,
      };
  }
}
