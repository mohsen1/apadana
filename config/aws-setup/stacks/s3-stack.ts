import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface S3StackProps extends cdk.StackProps {
  environment: string;
}

export class S3Stack extends cdk.Stack {
  public readonly uploadsBucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    // Create the uploads bucket with environment-specific name
    const bucketName =
      props.environment === 'preview'
        ? `apadana-uploads-preview-${process.env.VERCEL_GIT_COMMIT_SHA || 'default'}`
        : `apadana-uploads-${props.environment}`;

    this.uploadsBucket = new s3.Bucket(this, 'UploadsBucket', {
      bucketName,
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      // Use DESTROY for preview environments, RETAIN for others
      removalPolicy:
        props.environment === 'preview' ? cdk.RemovalPolicy.DESTROY : cdk.RemovalPolicy.RETAIN,
      // Enable auto-delete for preview environments
      autoDeleteObjects: props.environment === 'preview',
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
                // Delete objects after 1 day in preview environments
                expiration: cdk.Duration.days(1),
              },
            ]
          : undefined,
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
  }
}
