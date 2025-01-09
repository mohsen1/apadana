import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma/client';

import { assertError } from '@/utils';
import { createLogger } from '@/utils/logger';

const logger = createLogger('health-api');

export async function GET() {
  try {
    // Test query to check DB connection
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({ status: 'healthy', database: 'connected' }, { status: 200 });
  } catch (error) {
    assertError(error);
    logger.error('Database health check failed:', error);

    return NextResponse.json(
      { status: 'unhealthy', database: 'disconnected', error: error.message },
      { status: 503 },
    );
  }
}
