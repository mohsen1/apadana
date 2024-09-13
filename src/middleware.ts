import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Docs: https://clerk.com/docs/references/nextjs/clerk-middleware

const isProtectedRoute = createRouteMatcher([
  '/listing/create',
  '/listing/(.*)/manage',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    // Don't run for static assets
    '/((?!_next|storybook|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/api(.*)',
  ],
};
