export type Environment = 'production' | 'development' | 'preview';

export interface StackConfig {
  name: string;
  prefix: string;
  environment: Environment;
  region: string;
  retention: {
    enabled: boolean;
    resources: string[];
  };
}

export interface ResourceConfig {
  rds: {
    instanceIdentifier: string;
    port: number;
    dbName: string;
    username: string;
  };
  memoryDb: {
    clusterName: string;
    port: number;
  };
  s3: {
    bucketPrefix: string;
  };
  secretsManager: {
    dbSecretPrefix: string;
  };
}

export interface NetworkConfig {
  vpcName: string;
  securityGroups: {
    rds: string;
    memoryDb: string;
  };
}

export interface AWSConfig {
  stack: StackConfig;
  resources: ResourceConfig;
  network: NetworkConfig;
}
