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
      const stackDetails = await cfClient.send(
        new DescribeStacksCommand({
          StackName: stackSummary.StackName,
        }),
      );
      const stack = stackDetails.Stacks?.[0];
      if (!stack) continue;

      const tags = stack.Tags || [];
      if (!tags.some((tag: Tag) => tag.Key === 'managed-by' && tag.Value === 'apadana-aws-setup')) {
        logger.warn(`Found untagged stack: ${stack.StackName}`);
        await cfClient.send(new DeleteStackCommand({ StackName: stack.StackName }));
        logger.info(`Deleted untagged stack: ${stack.StackName}`);
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
          await s3Client.send(new DeleteBucketCommand({ Bucket: bucket.Name }));
          logger.info(`Deleted untagged bucket: ${bucket.Name}`);
        }
      } catch (error) {
        assertError(error);
        // If bucket has no tags, delete it
        logger.warn(`Bucket ${bucket.Name} has no tags, deleting...`);
        await s3Client.send(new DeleteBucketCommand({ Bucket: bucket.Name }));
        logger.info(`Deleted untagged bucket: ${bucket.Name}`);
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
