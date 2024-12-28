import { Link } from '@react-email/components';

export function EmailCallToActionButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className='bg-primary mt-6 inline-block rounded-md px-6 py-3 font-medium'>
      <span className='inline-block text-white'>{children}</span>
    </Link>
  );
}
