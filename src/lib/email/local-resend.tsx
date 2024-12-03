import {
  CreateEmailOptions,
  CreateEmailRequestOptions,
  CreateEmailResponse,
} from 'resend';

import prisma from '@/lib/prisma/client';

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
        const { renderToString } = await import('react-dom/server');
        html = renderToString(payload.react);
      }

      await prisma.localEmail.create({
        data: {
          from: payload.from,
          to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
          subject: payload.subject,
          html,
        },
      });
      // Mimic Resend's response
      return { data: { id: 'mock-email-id' }, error: null };
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
