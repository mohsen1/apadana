import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3, custom_resources as cr } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { BaseStack, BaseStackProps } from './base-stack';
import { getEnvConfig } from '../config/factory';

const logger = createLogger(import.meta.filename);

interface BucketConfig {
  cors: {
    allowedHeaders: string[];
    allowedMethods: s3.HttpMethods[];
    allowedOrigins: string[];
    exposedHeaders: string[];
    maxAge: number;
  }[];
  versioned: boolean;
  encryption: s3.BucketEncryption;
  publicReadAccess: boolean;
  blockPublicAccess: s3.BlockPublicAccess;
  enforceSSL: boolean;
  lifecycleRules: s3.LifecycleRule[];
}

export class S3Stack extends BaseStack {
  public readonly bucket: s3.IBucket;
  public readonly bucketNameOutput: cdk.CfnOutput;

  private getBucketConfig(): BucketConfig {
    return {
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
            s3.HttpMethods.HEAD,
          ],
          allowedOrigins: [
            'https://*.apadana.localhost',
            'https://apadana.app',
            'https://www.apadana.app',
            'https://*.apadana.app',
            'https://*.vercel.app',
          ],
          exposedHeaders: [
            'ETag',
            'x-amz-server-side-encryption',
            'x-amz-request-id',
            'x-amz-id-2',
            'Content-Length',
            'Content-Type',
            'Access-Control-Allow-Origin',
            'Access-Control-Allow-Methods',
            'Access-Control-Allow-Headers',
          ],
          maxAge: 3000,
        },
      ],
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
          enabled: true,
        },
      ],
    };
  }

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating S3 stack for environment: ${props.environment}`);

    // Add service-specific tag
    cdk.Tags.of(this).add('service', 's3');

    const bucketName = `ap-${cfg.environment}-${this.account}-${this.region}`.trim();
    const config = this.getBucketConfig();

    // Import the existing bucket
    this.bucket = s3.Bucket.fromBucketName(this, 'ExistingBucket', bucketName);
    logger.debug('Imported existing bucket');

    // Update bucket configuration
    new cr.AwsCustomResource(this, 'UpdateBucketConfig', {
      onCreate: {
        service: 'S3',
        action: 'getBucketCors',
        parameters: { Bucket: bucketName },
        physicalResourceId: cr.PhysicalResourceId.of(`${bucketName}-config`),
        ignoreErrorCodesMatching: '.*',
      },
      onUpdate: {
        service: 'S3',
        action: 'putBucketCors',
        parameters: {
          Bucket: bucketName,
          CORSConfiguration: { CORSRules: config.cors },
        },
        physicalResourceId: cr.PhysicalResourceId.of(`${bucketName}-config`),
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [this.bucket.arnForObjects('*'), this.bucket.bucketArn],
      }),
    });

    // Update versioning
    new cr.AwsCustomResource(this, 'UpdateBucketVersioning', {
      onCreate: {
        service: 'S3',
        action: 'getBucketVersioning',
        parameters: { Bucket: bucketName },
        physicalResourceId: cr.PhysicalResourceId.of(`${bucketName}-versioning`),
      },
      onUpdate: {
        service: 'S3',
        action: 'putBucketVersioning',
        parameters: {
          Bucket: bucketName,
          VersioningConfiguration: {
            Status: config.versioned ? 'Enabled' : 'Suspended',
          },
        },
        physicalResourceId: cr.PhysicalResourceId.of(`${bucketName}-versioning`),
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [this.bucket.arnForObjects('*'), this.bucket.bucketArn],
      }),
    });

    this.bucketNameOutput = new cdk.CfnOutput(this, 'BucketName', {
      exportName: `${this.stackName}-BucketName`,
      value: this.bucket.bucketName,
      description: 'Name of the S3 bucket',
    });
    logger.debug('Added bucket name output');
  }
}
