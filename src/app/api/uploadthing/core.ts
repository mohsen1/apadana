import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';
import { type FileRouter, createUploadthing } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

import prisma from '@/lib/prisma/client';

const f = createUploadthing();

const auth = async (req: Request) => {
  // Get the Clerk user from the request
  const auth = getAuth(req as NextRequest);
  if (!auth.userId) {
    // eslint-disable-next-line no-console
    console.error('User is not authenticated');
    return null;
  }

  // Find the user in the database using Prisma
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
  });

  if (!user) {
    // eslint-disable-next-line no-console
    console.error(
      'User not found in database with auth response:',
      JSON.stringify(auth),
    );
    return null;
  }

  return user;
};
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({
    image: {
      /**
       * For full list of options and defaults, see the File Route API reference
       * @see https://docs.uploadthing.com/file-routes#route-config
       */
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const user = await auth(req);

      // If you throw, the user will not be able to upload
      if (!user) throw new UploadThingError('Unauthorized');

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      // eslint-disable-next-line no-console
      console.log('Upload complete for userId:', metadata.userId);

      // eslint-disable-next-line no-console
      console.log('file url', file.url);

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
