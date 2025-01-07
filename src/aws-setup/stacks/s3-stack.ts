import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

import { getEnvConfig } from '../config/factory';

const logger = createLogger(import.meta.filename);

interface S3StackProps extends cdk.StackProps {
  environment: string;
  removalPolicy?: cdk.RemovalPolicy;
}

export class S3Stack extends cdk.Stack {
  public readonly bucketNameOutput: cdk.CfnOutput;
  public readonly bucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating S3 stack for environment: ${props.environment}`);

    const bucketName = `ap-${cfg.environment}-${this.account}-${this.region}`;
    let bucket: s3.IBucket;

    try {
      bucket = s3.Bucket.fromBucketName(this, 'ExistingBucket', bucketName);
      logger.debug('Imported existing S3 bucket');
    } catch (error) {
      assertError(error);
      const newBucket = new s3.Bucket(this, 'ApadanaBucket', {
        bucketName,
        versioned: true,
        encryption: s3.BucketEncryption.S3_MANAGED,
        publicReadAccess: false,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        enforceSSL: true,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        cors: [
          {
            allowedMethods: [
              s3.HttpMethods.GET,
              s3.HttpMethods.PUT,
              s3.HttpMethods.POST,
              s3.HttpMethods.DELETE,
              s3.HttpMethods.HEAD,
            ],
            allowedOrigins: [
              'https://*.apadana.local',
              'https://apadana.app',
              'https://*.apadana.app',
              'https://*.vercel.app',
            ],
            allowedHeaders: ['*'],
            exposedHeaders: [
              'ETag',
              'x-amz-server-side-encryption',
              'x-amz-request-id',
              'x-amz-id-2',
            ],
            maxAge: 3000,
          },
        ],
      });
      logger.debug('Created new S3 bucket');

      newBucket.addLifecycleRule({
        abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
        enabled: true,
      });
      logger.debug('Added lifecycle rule to S3 bucket');

      bucket = newBucket;
    }

    this.bucket = bucket;
    this.bucketNameOutput = new cdk.CfnOutput(this, 'BucketName', {
      exportName: `${this.stackName}-BucketName`,
      value: bucket.bucketName,
      description: 'Name of the S3 bucket',
    });
    logger.debug('Added bucket name output');
  }
}
