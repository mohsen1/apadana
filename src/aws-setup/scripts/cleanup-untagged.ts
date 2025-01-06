import {
  CloudFormationClient,
  DeleteStackCommand,
  DescribeStacksCommand,
  ListStacksCommand,
  Tag,
} from '@aws-sdk/client-cloudformation';
import {
  DeleteBucketCommand,
  GetBucketTaggingCommand,
  ListBucketsCommand,
  S3Client,
  S3ServiceException,
} from '@aws-sdk/client-s3';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger(__filename);

async function cleanupUntaggedResources() {
  const cfClient = new CloudFormationClient({});
  const s3Client = new S3Client({});

  try {
    // List all CloudFormation stacks
    const stacks = await cfClient.send(new ListStacksCommand({}));
    for (const stackSummary of stacks.StackSummaries || []) {
      try {
        // Skip stacks that are already being deleted or have been deleted
        if (
          stackSummary.StackStatus === 'DELETE_IN_PROGRESS' ||
          stackSummary.StackStatus === 'DELETE_COMPLETE'
        ) {
          continue;
        }

        const stackDetails = await cfClient.send(
          new DescribeStacksCommand({
            StackName: stackSummary.StackName,
          }),
        );
        const stack = stackDetails.Stacks?.[0];
        if (!stack) continue;

        const tags = stack.Tags || [];
        if (
          !tags.some((tag: Tag) => tag.Key === 'managed-by' && tag.Value === 'apadana-aws-setup')
        ) {
          logger.warn(`Found untagged stack: ${stack.StackName}`);
          try {
            await cfClient.send(new DeleteStackCommand({ StackName: stack.StackName }));
            logger.info(`Deleted untagged stack: ${stack.StackName}`);
          } catch (deleteError) {
            assertError(deleteError);
            logger.error(`Failed to delete stack ${stack.StackName}:`, deleteError.message);
          }
        }
      } catch (stackError) {
        assertError(stackError);
        // Skip if stack doesn't exist or other stack-specific errors
        logger.warn(`Skipping stack ${stackSummary.StackName}: ${stackError.message}`);
        continue;
      }
    }

    // List all S3 buckets
    const buckets = await s3Client.send(new ListBucketsCommand({}));
    for (const bucket of buckets.Buckets || []) {
      try {
        const tagging = await s3Client.send(new GetBucketTaggingCommand({ Bucket: bucket.Name }));
        const tags = tagging.TagSet || [];
        if (!tags.some((tag) => tag.Key === 'managed-by' && tag.Value === 'apadana-aws-setup')) {
          logger.warn(`Found untagged bucket: ${bucket.Name}`);
          try {
            await s3Client.send(new DeleteBucketCommand({ Bucket: bucket.Name }));
            logger.info(`Deleted untagged bucket: ${bucket.Name}`);
          } catch (deleteError) {
            assertError(deleteError);
            logger.error(`Failed to delete bucket ${bucket.Name}:`, deleteError.message);
          }
        }
      } catch (bucketError) {
        if (
          bucketError instanceof S3ServiceException &&
          bucketError.$metadata?.httpStatusCode === 404
        ) {
          logger.warn(`Bucket ${bucket.Name} not found, skipping...`);
          continue;
        }
        // If bucket has no tags, try to delete it
        logger.warn(`Bucket ${bucket.Name} has no tags, attempting to delete...`);
        try {
          await s3Client.send(new DeleteBucketCommand({ Bucket: bucket.Name }));
          logger.info(`Deleted untagged bucket: ${bucket.Name}`);
        } catch (deleteError) {
          assertError(deleteError);
          logger.error(`Failed to delete bucket ${bucket.Name}:`, deleteError.message);
        }
      }
    }

    logger.info('Cleanup completed successfully');
  } catch (error) {
    assertError(error);
    logger.error('Error during cleanup:', error);
    process.exit(1);
  }
}

void cleanupUntaggedResources();
