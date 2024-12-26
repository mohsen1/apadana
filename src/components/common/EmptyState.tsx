import { cn } from '@/lib/utils';

export function EmptyState({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex h-full min-h-44 flex-col items-center justify-center', className)}>
      {children}
    </div>
  );
}
