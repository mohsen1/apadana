import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: number;
}

export default function Loading({ className, size = 24 }: LoadingProps) {
  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <Loader2 className='animate-spin' size={size} />
    </div>
  );
}
