import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { getEnvConfig } from '../config/factory';

interface S3StackProps extends cdk.StackProps {
  environment: string;
}

export class S3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);

    // S3 bucket for that environment
    const bucket = new s3.Bucket(this, 'ApadanaBucket', {
      bucketName: `ap-${cfg.environment}-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    // Example lifecycle rules for cost optimization
    bucket.addLifecycleRule({
      abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
      enabled: true,
    });
  }
} 