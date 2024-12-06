'use server';

import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { z } from 'zod';

import { actionClient } from '@/lib/safe-action';

import { isDevOrTestEnv } from '@/utils/environment';
import logger from '@/utils/logger';

const inputSchema = z.object({
  files: z.array(
    z.object({
      filename: z.string(),
      contentType: z.string(),
    }),
  ),
});

const outputSchema = z.object({
  urls: z.array(
    z.object({
      url: z.string(),
      key: z.string(),
    }),
  ),
});

const getUploadSignedUrl = actionClient
  .schema(inputSchema)
  .outputSchema(outputSchema)
  .action(async ({ parsedInput }) => {
    const {
      NEXT_PUBLIC_S3_UPLOAD_REGION,
      S3_UPLOAD_KEY,
      NEXT_PUBLIC_DOMAIN,
      S3_UPLOAD_SECRET,
    } = process.env;

    if (isDevOrTestEnv) {
      // Return fake signed URLs for e2e testing
      const urls = parsedInput.files.map((file) => {
        const fileExtension = file.filename.split('.').pop() ?? '';
        const key = `fake_upload_${crypto.randomUUID()}.${fileExtension}`;
        const url = `http://${NEXT_PUBLIC_DOMAIN}/api/fake-upload/${key}`;

        return { url, key };
      });

      return { urls };
    }

    // Initialize S3 client
    const s3Client = new S3Client({
      region: NEXT_PUBLIC_S3_UPLOAD_REGION,
      credentials: {
        accessKeyId: S3_UPLOAD_KEY,
        secretAccessKey: S3_UPLOAD_SECRET,
      },
    });
    try {
      const urls = await Promise.all(
        parsedInput.files.map(async (file) => {
          // Generate a unique key for each file
          const fileExtension = file.filename.split('.').pop() ?? '';
          const key = `uploads/${new Date().getFullYear()}/${new Date().getMonth()}/${crypto.randomUUID()}.${fileExtension}`;

          const command = new PutObjectCommand({
            Bucket: process.env.NEXT_PUBLIC_S3_UPLOAD_BUCKET,
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

export { getUploadSignedUrl };
