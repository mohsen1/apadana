import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

export class BootstrapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    logger.info('Creating bootstrap stack');
  }
} 