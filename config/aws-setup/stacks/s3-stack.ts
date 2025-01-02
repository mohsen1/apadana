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

    // Import the existing uploads bucket
    this.uploadsBucket = s3.Bucket.fromBucketAttributes(this, 'UploadsBucket', {
      bucketName: `apadana-uploads-${props.environment}`,
      bucketArn: `arn:aws:s3:::apadana-uploads-${props.environment}`,
    });

    // Add bucket policy
    const bucketPolicy = new s3.BucketPolicy(this, 'UploadsBucketPolicy', {
      bucket: this.uploadsBucket,
    });

    bucketPolicy.document.addStatements(
      new iam.PolicyStatement({
        sid: 'Statement1',
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:GetObject'],
        resources: [this.uploadsBucket.arnForObjects('*')],
      }),
      new iam.PolicyStatement({
        sid: 'Statement2',
        effect: iam.Effect.ALLOW,
        principals: [new iam.AnyPrincipal()],
        actions: ['s3:PutObject', 's3:GetObject'],
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
