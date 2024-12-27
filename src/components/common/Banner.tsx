'use client';

import { X } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export interface BannerProps {
  /** The title of the banner */
  title: string;

  /** The description of the banner */
  description: string;

  /**
   * The query param name to check to decide if the banner should be shown
   * When the banner is closed, the query param is removed from the URL
   * Example:
   *
   * If the query param is `newListing`, the banner will be shown if the query param is present
   * and removed from the URL when the banner is closed. e.g. /listing/123?newListing=true
   */
  queryParam: string;

  /** The callback to call when the banner is closed */
  onClose?: () => void;
}

/**
 * A banner that is displayed when a query param is present.
 */
export function Banner({ title, description, onClose, queryParam }: BannerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClose = useCallback(() => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (queryParam) {
      newSearchParams.delete(queryParam);
    }
    onClose?.();
    router.replace(`${location.pathname}?${newSearchParams.toString()}`);
  }, [queryParam, searchParams, router, onClose]);

  if (!searchParams.get(queryParam)) {
    return null;
  }

  return (
    <div className='bg-accent relative mx-2 my-2 flex h-full flex-col items-center justify-center rounded-md p-4 lg:mx-0'>
      <X
        className='hover:bg-background/30 absolute right-1 top-1 hover:cursor-pointer hover:rounded-full'
        onClick={handleClose}
      />
      <h1 className='text-2xl font-semibold'>{title}</h1>
      <p className='text-sm'>{description}</p>
    </div>
  );
}
