import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

import logger from '@/utils/logger';

export const runtime = 'nodejs';

export async function GET(
  _request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  if (
    process.env.TEST_ENV !== 'e2e' &&
    process.env.NODE_ENV !== 'development'
  ) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const filePath = params.path.join('/');
  const fullPath = path.join(process.cwd(), 'e2e', 'uploads', filePath);

  if (!fs.existsSync(fullPath)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const fileContent = fs.readFileSync(fullPath);

  return new NextResponse(fileContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  // Only allow in test environment
  if (
    process.env.TEST_ENV !== 'e2e' &&
    process.env.NODE_ENV !== 'development'
  ) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    // Reconstruct the file path from the URL segments
    const filePath = params.path.join('/');

    // Create the uploads directory in the e2e test folder if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'e2e', 'uploads');
    const fullPath = path.join(uploadDir, filePath);

    // Ensure the directory exists
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    // Get the file content from the request
    const fileContent = await request.arrayBuffer();

    // Write the file
    fs.writeFileSync(fullPath, Buffer.from(fileContent));

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    logger.error('Error handling fake upload:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
