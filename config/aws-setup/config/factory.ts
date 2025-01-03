import { AWSConfig, Environment } from './types';

export function createConfig(environment: Environment, region: string): AWSConfig {
  const prefix = 'apadana';

  return {
    stack: {
      name: `${prefix}-${environment}`,
      prefix,
      environment,
      region,
    },
    resources: {
      rds: {
        instanceIdentifier: `${prefix}-${environment}`,
        port: 5432,
        dbName: 'apadana',
        username: 'postgres',
      },
      memoryDb: {
        clusterName: `${prefix}-${environment}`,
        port: 6379,
      },
      s3: {
        bucketPrefix: `${prefix}-uploads`,
      },
      secretsManager: {
        dbSecretPrefix: `${prefix}-${environment}`,
      },
    },
    network: {
      vpcName: `${prefix}-vpc-${environment}`,
      securityGroups: {
        rds: `${prefix}-rds-sg-${environment}`,
        memoryDb: `${prefix}-memorydb-sg-${environment}`,
      },
    },
  };
}

export function getEnvironment(vercelEnv?: string): Environment {
  if (!vercelEnv || vercelEnv === 'preview') {
    return 'development';
  }
  return vercelEnv as Environment;
}

export function getRegion(): string {
  return process.env.AWS_REGION || 'us-east-1';
}

export function getConfig(): AWSConfig {
  const environment = getEnvironment(process.env.VERCEL_ENV);
  const region = getRegion();
  return createConfig(environment, region);
}
