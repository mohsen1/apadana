import { Suspense } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import CreateListingForm from '@/app/listing/create/form';

function LoadingFallback() {
  return (
    <Card className='max-w-4xl mx-auto'>
      <CardHeader>
        <CardTitle>
          <Skeleton className='h-8 w-64' />
        </CardTitle>
      </CardHeader>
      <CardContent className='space-y-6'>
        {/* Form fields skeleton */}
        <div className='space-y-2'>
          <Skeleton className='h-4 w-24' /> {/* Label */}
          <Skeleton className='h-10 w-full' /> {/* Input */}
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-10 w-full' />
        </div>
        <div className='space-y-2'>
          <Skeleton className='h-4 w-28' />
          <Skeleton className='h-32 w-full' /> {/* Textarea */}
        </div>
        {/* Navigation buttons */}
        <div className='flex justify-between pt-4'>
          <Skeleton className='h-10 w-24' />
          <Skeleton className='h-10 w-24' />
        </div>
      </CardContent>
    </Card>
  );
}

export default function CreateListingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CreateListingForm />
    </Suspense>
  );
}
