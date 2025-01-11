import { CreateEmailOptions, CreateEmailRequestOptions, CreateEmailResponse } from 'resend';

import prisma from '@/lib/prisma/client';

import { createLogger } from '@/utils/logger';

const logger = createLogger('local-resend');

export class LocalResend {
  contacts = {
    create: async () => {
      return { data: { id: 'mock-contact-id' }, error: null };
    },
  };
  emails = {
    send: async (
      payload: CreateEmailOptions,
      _options?: CreateEmailRequestOptions,
    ): Promise<CreateEmailResponse> => {
      let html = payload.html ?? '';

      // Render React
      if (payload.react) {
        // @ts-expect-error hack for local development
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { renderToString } = await import('react-dom/server');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        html = renderToString(payload.react);
      }

      const email = await prisma.localEmail.create({
        data: {
          from: payload.from,
          to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
          subject: payload.subject,
          html,
        },
      });

      logger.info('Local email created', {
        id: email.id,
        from: payload.from,
        to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
        subject: payload.subject,
      });

      return { data: { id: email.id }, error: null };
    },
    create: async () => {
      throw new Error('not implemented');
    },
    get: async () => {
      throw new Error('not implemented');
    },
    update: async () => {
      throw new Error('not implemented');
    },
    cancel: async () => {
      throw new Error('not implemented');
    },
  };
}
