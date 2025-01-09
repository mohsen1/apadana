import fs from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

import { shouldUseFakeUploads } from '@/app/upload/constants';
import { createLogger } from '@/utils/logger';

const logger = createLogger('e2e-upload-route');

export const runtime = 'nodejs';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  if (!shouldUseFakeUploads) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  try {
    const { path: pathParam } = await params;
    const filePath = pathParam.join('/');
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'e2e', 'uploads');
    const fullPath = path.join(uploadDir, filePath);

    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    const fileContent = await request.arrayBuffer();

    fs.writeFileSync(fullPath, Buffer.from(fileContent));

    return new NextResponse(null, {
      status: 200,
    });
  } catch (error) {
    logger.error('Error handling fake upload:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function OPTIONS(_request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
