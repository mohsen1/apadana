import * as cdk from 'aws-cdk-lib';
import { aws_cloudfront as cloudfront } from 'aws-cdk-lib';
import { aws_cloudfront_origins as origins } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { createLogger } from '@/utils/logger';

import { getEnvConfig } from '../config/factory';

const logger = createLogger(import.meta.filename);

interface CloudFrontStackProps extends cdk.StackProps {
  environment: string;
  bucket: s3.IBucket;
}

export class CloudFrontStack extends cdk.Stack {
  public readonly distributionDomainOutput: cdk.CfnOutput;

  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);

    const cfg = getEnvConfig(props.environment);
    logger.info(`Creating CloudFront stack for environment: ${props.environment}`);

    const distribution = new cloudfront.Distribution(this, 'ApadanaDistribution', {
      defaultBehavior: {
        origin: new origins.S3Origin(props.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
      },
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      enabled: true,
      comment: `Apadana CDN for ${cfg.environment}`,
      defaultRootObject: 'index.html',
      enableLogging: true,
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
