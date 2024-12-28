import { Link } from '@react-email/components';

export function EmailCallToActionButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className='bg-primary hover:bg-primary-hover text-primary-foreground mt-6 inline-block rounded-md px-6 py-3 font-medium'
    >
      <span className='text-background inline-block'>{children}</span>
    </Link>
  );
}
