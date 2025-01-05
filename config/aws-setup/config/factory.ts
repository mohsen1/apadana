import { AWSConfig, Environment } from './types';

export function createConfig(environment: Environment, region: string): AWSConfig {
  const prefix = 'apadana';
  const isProd = environment === 'production';
  const isPreview = environment === 'preview';

  // For preview, we'll use smaller instances and minimal retention
  const previewConfig = isPreview
    ? {
        rds: {
          instanceClass: 't3.micro',
          allocatedStorage: 10,
        },
        memoryDb: {
          nodeType: 'db.t4g.small',
          numShards: 1,
          numReplicas: 0,
        },
      }
    : undefined;

  return {
    stack: {
      name: `${prefix}-${environment}`,
      prefix,
      environment,
      region,
      retention: {
        enabled: isProd,
        resources: ['rds', 'memorydb', 's3', 'vpc'],
      },
    },
    resources: {
      rds: {
        instanceIdentifier: `${prefix}-${environment}`,
        port: 5432,
        dbName: 'apadana',
        username: 'postgres',
        ...previewConfig?.rds,
      },
      memoryDb: {
        clusterName: `${prefix}-${environment}`,
        port: 6379,
        ...previewConfig?.memoryDb,
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

export function getEnvironment(): Environment {
  return (process.env.AWS_DEPLOYMENT_STACK_ENV || 'development') as Environment;
}

export function getRegion(): string {
  return process.env.AWS_REGION || 'us-east-1';
}

export function getConfig(): AWSConfig {
  const environment = getEnvironment();
  const region = getRegion();
  return createConfig(environment, region);
}
