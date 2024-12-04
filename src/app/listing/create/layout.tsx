import { AuthBoundary } from '@/components/auth/AuthBoundary';

export const metadata = {
  title: 'Create Listing',
};

export default function CreateListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthBoundary protection={{ authRequired: true }} showAccessDenied>
      {children}
    </AuthBoundary>
  );
}
