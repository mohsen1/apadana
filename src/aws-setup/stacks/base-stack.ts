import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export interface BaseStackProps extends cdk.StackProps {
  environment: string;
  removalPolicy?: cdk.RemovalPolicy;
}

export class BaseStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    // Add consistent tags without timestamps
    cdk.Tags.of(this).add('managed-by', 'apadana-aws-setup');
    cdk.Tags.of(this).add('environment', props.environment);
  }
}
