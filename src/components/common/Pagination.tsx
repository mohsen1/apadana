import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface PaginationProps {
  total: number;
  take: number;
  skip: number;
  onPageChange: (skip: number, take: number) => void;
}

export function Pagination({ total, take, skip, onPageChange }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateQueryParams = (newSkip: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('skip', newSkip.toString());
    params.set('take', take.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handlePageChange = (newSkip: number) => {
    updateQueryParams(newSkip);
    onPageChange(newSkip, take);
  };

  return (
    <div className='flex items-center justify-end space-x-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={() => {
          const newSkip = Math.max(0, skip - take);
          handlePageChange(newSkip);
        }}
        disabled={skip === 0}
      >
        <ChevronLeft className='h-4 w-4' />
        Previous
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={() => {
          const newSkip = skip + take;
          handlePageChange(newSkip);
        }}
        disabled={skip + take >= total}
      >
        Next
        <ChevronRight className='h-4 w-4' />
      </Button>
    </div>
  );
}
