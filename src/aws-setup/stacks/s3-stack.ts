import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
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

    // Create the bucket instead of referencing existing one
    this.bucket = new s3.Bucket(this, 'Bucket', {
      bucketName,
      cors: config.cors,
      versioned: config.versioned,
      encryption: config.encryption,
      publicReadAccess: config.publicReadAccess,
      blockPublicAccess: config.blockPublicAccess,
      enforceSSL: config.enforceSSL,
      lifecycleRules: config.lifecycleRules,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For development ease
      autoDeleteObjects: true, // For development ease
    });
    logger.debug('Created new bucket');

    this.bucketNameOutput = new cdk.CfnOutput(this, 'BucketName', {
      exportName: `${this.stackName}-BucketName`,
      value: this.bucket.bucketName,
      description: 'Name of the S3 bucket',
    });
    logger.debug('Added bucket name output');
  }
}
