'use server';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

import { actionClient, createRateLimiter, RATE_LIMIT_BASED_ON_IP } from '@/lib/safe-action';
import { FileUploadInputSchema, FileUploadOutputSchema } from '@/lib/schema';

import { shouldUseFakeUploads } from '@/app/upload/constants';
import { createLogger } from '@/utils/logger';

const logger = createLogger();

export const getUploadSignedUrl = actionClient
  .use(createRateLimiter({ basedOn: [RATE_LIMIT_BASED_ON_IP] }))
  .schema(FileUploadInputSchema)
  .outputSchema(FileUploadOutputSchema)
  .action(async ({ parsedInput, ctx }) => {
    if (!ctx.userId) {
      throw new Error('User ID is required');
    }

    if (shouldUseFakeUploads) {
      // Return fake signed URLs for e2e testing
      const urls = parsedInput.files.map((file) => {
        const fileExtension = file.filename.split('.').pop() ?? '';
        const key = `fake_upload_${crypto.randomUUID()}.${fileExtension}`;
        const url = `/api/e2e/upload/${key}`;

        return { url, key };
      });

      return { urls };
    }

    // Initialize S3 client
    const s3Client = new S3Client({
      region: process.env.NEXT_PUBLIC_AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    try {
      const urls = await Promise.all(
        parsedInput.files.map(async (file) => {
          // Generate a unique key for each file
          const fileExtension = file.filename.split('.').pop() ?? '';
          const path = `uploads/${new Date().getFullYear()}/${new Date().getMonth()}`.trim();
          let filename = crypto.randomUUID();

          // Mark files uploaded for e2e testing for easier identification.
          // A clean up script can be run to delete these files after e2e tests are run.
          if (process.env.NEXT_PUBLIC_TEST_ENV === 'e2e') {
            filename = `e2e_test_upload_${filename}`;
          }

          const key = `${path}/${filename}${fileExtension ? `.${fileExtension}` : ''}`.trim();

          const command = new PutObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME,
            Key: key,
            ContentType: file.contentType,
          });

          const url = await getSignedUrl(s3Client, command, {
            expiresIn: 3600,
          }); // URL expires in 1 hour

          return { url, key };
        }),
      );

      return { urls };
    } catch (error) {
      logger.error('Error generating signed URLs:', error);
      throw new Error('Failed to generate upload URLs');
    }
  });
