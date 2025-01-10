import * as cdk from 'aws-cdk-lib';
import { aws_cloudfront as cloudfront, aws_s3 as s3 } from 'aws-cdk-lib';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { BaseStack, BaseStackProps } from './base-stack';
import { getEnvConfig } from '../config/factory';

const logger = createLogger(import.meta.filename);

interface CloudFrontStackProps extends BaseStackProps {
  bucket: s3.IBucket;
}

export class CloudFrontStack extends BaseStack {
  public readonly distributionDomainOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating CloudFront stack for environment: ${props.environment}`);

    // Add service-specific tag
    cdk.Tags.of(this).add('service', 'cloudfront');

    // Create a response headers policy for CORS
    const corsHeadersPolicy = new cloudfront.ResponseHeadersPolicy(this, 'CorsHeadersPolicy', {
      responseHeadersPolicyName: `ap-cors-headers-${cfg.environment}`,
      corsBehavior: {
        accessControlAllowCredentials: false,
        accessControlAllowHeaders: ['*'],
        accessControlAllowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE'],
        accessControlAllowOrigins: [
          'https://*.apadana.local',
          'https://apadana.app',
          'https://www.apadana.app',
          'https://*.apadana.app',
          'https://*.vercel.app',
        ],
        accessControlExposeHeaders: [
          'ETag',
          'x-amz-server-side-encryption',
          'x-amz-request-id',
          'x-amz-id-2',
        ],
        accessControlMaxAge: cdk.Duration.seconds(3000),
        originOverride: true,
      },
    });

    const distribution = new cloudfront.Distribution(this, 'ApadanaDistribution', {
      defaultBehavior: {
        origin: new S3Origin(props.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
        responseHeadersPolicy: corsHeadersPolicy,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      enabled: true,
      comment: `Apadana CDN for ${cfg.environment}`,
      defaultRootObject: 'index.html',
      enableLogging: false,
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
    });

    this.distributionDomainOutput = new cdk.CfnOutput(this, 'DistributionDomain', {
      exportName: `${this.stackName}-DistributionDomain`,
      value: distribution.distributionDomainName,
      description: 'Domain name of the CloudFront distribution',
    });
    logger.debug('Added CloudFront distribution domain output');
  }
}
