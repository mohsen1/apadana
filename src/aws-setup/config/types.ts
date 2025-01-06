export interface EnvConfig {
  environment: string;
  region: string;

  rdsInstanceType: string;
  rdsAllocatedStorage: number;
  rdsMaxAllocatedStorage: number;

  redisNodeType: string;
  redisNumReplicas: number;
  redisShardCount: number;

  backupRetentionDays: number;

  // Flag for allowing public DB access (for Vercel)
  publicDbAccess: boolean;
}
