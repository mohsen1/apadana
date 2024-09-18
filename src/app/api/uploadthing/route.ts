import { createRouteHandler } from 'uploadthing/next';

import { fileRouter } from './core';

const handler = createRouteHandler({
  router: fileRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
  },
});

export { handler as GET, handler as POST };
