'use client';

import { Loader2, SaveIcon } from 'lucide-react';

import { DisappearingComponent } from '@/components/common/DisappearingComponent';
import { Button } from '@/components/ui/button';

interface SaveButtonProps {
  isSubmitting: boolean;
  isValid?: boolean;
  isDirty?: boolean;
  status?: string;
  successMessage?: string;
  isSubmitSuccessful?: boolean;
}

export function SaveButton({
  isSubmitting,
  isValid = true,
  isDirty = true,
  status,
  successMessage = 'Your changes have been saved',
  isSubmitSuccessful = false,
}: SaveButtonProps) {
  return (
    <div className='bg-background sticky bottom-0 left-0 flex items-center justify-start py-4'>
      <Button
        disabled={isSubmitting || !isValid || !isDirty}
        type='submit'
        className='flex items-center gap-2'
      >
        {status === 'executing' ? (
          <>
            <Loader2 className='animate-spin' />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <SaveIcon />
            <span>Save Changes</span>
          </>
        )}
      </Button>
      {isSubmitSuccessful && !isSubmitting && (
        <DisappearingComponent disappearIn={3} className='mx-2 text-green-600'>
          {successMessage}
        </DisappearingComponent>
      )}
    </div>
  );
}
