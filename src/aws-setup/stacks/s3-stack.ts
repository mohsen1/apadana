import * as cdk from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

import { BaseStack, BaseStackProps } from './base-stack';
import { getEnvConfig } from '../config/factory';

const logger = createLogger(import.meta.filename);

interface BucketConfig {
  cors: {
    allowedHeaders: string[];
    allowedMethods: string[];
    allowedOrigins: string[];
    exposedHeaders: string[];
    maxAge: number;
  }[];
  versioned: boolean;
  encryption: s3.BucketEncryption;
  publicReadAccess: boolean;
  blockPublicAccess: s3.BlockPublicAccess;
  enforceSSL: boolean;
  lifecycleRules: {
    abortIncompleteMultipartUploadAfter: cdk.Duration;
    enabled: boolean;
  }[];
}

export class S3Stack extends BaseStack {
  public readonly bucket: s3.IBucket;
  public readonly bucketNameOutput: cdk.CfnOutput;

  private getBucketConfig(): BucketConfig {
    return {
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
          allowedOrigins: [
            'https://*.apadana.local',
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

  private createNewBucket(bucketName: string): s3.IBucket {
    const config = this.getBucketConfig();
    const bucket = new s3.Bucket(this, 'ApadanaBucket', {
      bucketName,
      versioned: config.versioned,
      encryption: config.encryption,
      publicReadAccess: config.publicReadAccess,
      blockPublicAccess: config.blockPublicAccess,
      enforceSSL: config.enforceSSL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: config.cors.map((rule) => ({
        ...rule,
        allowedMethods: rule.allowedMethods.map((method) => method as s3.HttpMethods),
      })),
    });

    config.lifecycleRules.forEach((rule) => {
      bucket.addLifecycleRule(rule);
    });

    logger.debug('Created new S3 bucket');
    return bucket;
  }

  private updateExistingBucket(bucketName: string): void {
    const config = this.getBucketConfig();
    const cfnBucket = new s3.CfnBucket(this, 'UpdateExistingBucket', {
      bucketName,
      corsConfiguration: {
        corsRules: config.cors,
      },
      versioningConfiguration: {
        status: config.versioned ? 'Enabled' : 'Suspended',
      },
      publicAccessBlockConfiguration: {
        blockPublicAcls: true,
        blockPublicPolicy: true,
        ignorePublicAcls: true,
        restrictPublicBuckets: true,
      },
    });
    cfnBucket.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    logger.debug('Updated existing S3 bucket configuration');
  }

  constructor(scope: Construct, id: string, props: BaseStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating S3 stack for environment: ${props.environment}`);

    // Add service-specific tag
    cdk.Tags.of(this).add('service', 's3');

    const bucketName = `ap-${cfg.environment}-${this.account}-${this.region}`.trim();
    let bucket: s3.IBucket;

    try {
      bucket = s3.Bucket.fromBucketName(this, 'ExistingBucket', bucketName);
      logger.debug('Imported existing S3 bucket');
      this.updateExistingBucket(bucketName);
    } catch (error) {
      assertError(error);
      bucket = this.createNewBucket(bucketName);
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
