import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class BootstrapStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // This can stay empty if you rely on cdk bootstrap via CLI
    // or you can add custom SSM parameters or org-level setup here.
  }
} 