import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface S3StackProps extends cdk.StackProps {
  environment: string;
  useExisting?: boolean;
}

export class S3Stack extends cdk.Stack {
  public readonly uploadsBucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    const bucketName =
      props.environment === 'preview'
        ? `apadana-uploads-preview`
        : `apadana-uploads-${props.environment}`;

    if (props.useExisting) {
      // Import existing bucket
      this.uploadsBucket = s3.Bucket.fromBucketName(this, 'ImportedUploadsBucket', bucketName);
    } else {
      // Create new bucket with configuration
      this.uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
        bucketName,
        publicReadAccess: true,
        blockPublicAccess: new s3.BlockPublicAccess({
          blockPublicAcls: false,
          blockPublicPolicy: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        }),
        versioned: true,
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
            allowedOrigins: ['*'],
            exposedHeaders: ['ETag'],
            maxAge: 3000,
          },
        ],
        lifecycleRules:
          props.environment === 'preview'
            ? [
                {
                  expiration: cdk.Duration.days(1),
                },
              ]
            : undefined,
        removalPolicy:
          props.environment === 'production' ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: props.environment !== 'production',
      });

      // Add bucket policy for public access
      const bucketPolicy = new s3.BucketPolicy(this, 'UploadsBucketPolicy', {
        bucket: this.uploadsBucket,
      });

      bucketPolicy.document.addStatements(
        new iam.PolicyStatement({
          sid: 'PublicRead',
          effect: iam.Effect.ALLOW,
          principals: [new iam.AnyPrincipal()],
          actions: ['s3:GetObject'],
          resources: [this.uploadsBucket.arnForObjects('*')],
        }),
        new iam.PolicyStatement({
          sid: 'AllowUpload',
          effect: iam.Effect.ALLOW,
          principals: [new iam.AnyPrincipal()],
          actions: ['s3:PutObject', 's3:DeleteObject'],
          resources: [this.uploadsBucket.arnForObjects('*')],
        }),
      );
    }

    // Output bucket ARN
    new cdk.CfnOutput(this, 'UploadsBucketArn', {
      value: this.uploadsBucket.bucketArn,
      description: 'Uploads bucket ARN',
      exportName: `ApadanaUploadsBucketArn-${props.environment}`,
    });

    // Output bucket name
    new cdk.CfnOutput(this, 'UploadsBucketName', {
      value: this.uploadsBucket.bucketName,
      description: 'Uploads bucket name',
      exportName: `ApadanaUploadsBucketName-${props.environment}`,
    });

    // Tag all resources
    cdk.Tags.of(this).add('Environment', props.environment);
    cdk.Tags.of(this).add('Project', 'Apadana');
  }
}
