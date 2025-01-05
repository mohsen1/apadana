export interface EnvConfig {
  environment: string;
  account: string;
  region: string;

  rdsInstanceType: string;
  rdsAllocatedStorage: number;
  rdsMaxAllocatedStorage: number;

  memoryDbNodeType: string;
  memoryDbNumReplicas: number;
  memoryDbShardCount: number;

  backupRetentionDays: number;

  // Flag for allowing public DB access (for Vercel)
  publicDbAccess: boolean;
}
