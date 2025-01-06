import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { getEnvConfig } from '../config/factory';

const logger = createLogger(__filename);

interface S3StackProps extends cdk.StackProps {
  environment: string;
}

export class S3Stack extends cdk.Stack {
  public readonly bucketNameOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating S3 stack for environment: ${props.environment}`);

    const bucket = new s3.Bucket(this, 'ApadanaBucket', {
      bucketName: `ap-${cfg.environment}-${this.account}-${this.region}`,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
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
    logger.debug('Created S3 bucket');

    // Add bucket policy to allow public read access
    const bucketPolicy = new s3.BucketPolicy(this, 'BucketPolicy', {
      bucket: bucket,
    });

    bucketPolicy.document.addStatements(
      new iam.PolicyStatement({
        actions: ['s3:GetObject'],
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        resources: [bucket.arnForObjects('*')],
      }),
    );
    logger.debug('Added public read access policy to bucket');

    bucket.addLifecycleRule({
      abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
      enabled: true,
    });
    logger.debug('Added lifecycle rule to S3 bucket');

    this.bucketNameOutput = new cdk.CfnOutput(this, 'BucketName', {
      exportName: `${this.stackName}-BucketName`,
      value: bucket.bucketName,
      description: 'Name of the S3 bucket',
    });
    logger.debug('Added bucket name output');
  }
}
