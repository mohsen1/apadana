import logger from '@/utils/logger';
import { S3Uploader } from './s3-uploader';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(request: Request) {
  if (!request.body) {
    return new Response('No request body', { status: 400 });
  }

  const s3Uploader = new S3Uploader();

  const iterator = await s3Uploader.handleUploadRequest(request);
  const response = await iterator.next();

  // kick the uploader into action
  await iterator.next();

  if (!response.done) {
    return response.value;
  }

  logger.error('No response from S3 uploader');

  return new Response('No response', { status: 500 });
}

export async function GET(request: Request) {
  return new Response('Only POST requests are supported', { status: 405 });
}
