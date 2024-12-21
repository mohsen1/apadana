'use client';

import { ChevronDown, ChevronUp, X } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { CreateListing } from '@/lib/prisma/schema';

function FormDebugger() {
  const methods = useFormContext<CreateListing>();
  const { formState, watch } = methods;
  const { errors } = formState;
  const values = watch();
  const [isVisible, setIsVisible] = React.useState(true);
  const [isMinimized, setIsMinimized] = React.useState(true);

  if (
    (typeof window !== 'undefined' &&
      window.location.hostname.toLowerCase().endsWith('apadana.local')) ||
    !isVisible
  ) {
    return null;
  }

  return (
    <div
      className={`bg-background border-border text-foreground fixed bottom-4 right-4 w-full
         max-w-lg rounded-lg border p-1 shadow-lg 
         transition-all
         duration-200 ${isMinimized ? 'h-12' : 'h-96'}`}
    >
      <div className='flex items-center justify-between'>
        <h3 className='text-foreground font-semibold'>Debug Information</h3>
        <div className='flex gap-2'>
          <span className='bg-muted rounded px-2 py-1 text-xs'>
            Valid: {formState.isValid ? '✅' : '❌'}
          </span>
          <span className='bg-muted rounded px-2 py-1 text-xs'>
            Dirty: {formState.isDirty ? '✅' : '❌'}
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className='hover:bg-accent rounded-full p-1 transition-colors'
        >
          {isMinimized ? <ChevronUp /> : <ChevronDown />}
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className='hover:bg-accent rounded-full p-1 transition-colors'
        >
          <X />
        </button>
      </div>

      {!isMinimized && (
        <div className='h-[calc(100%-2rem)] overflow-auto p-2'>
          {Object.keys(errors).length > 0 && (
            <div className='mb-4'>
              <h4 className='text-destructive mb-2 text-sm font-medium'>Validation Errors:</h4>
              <pre className='text-foreground bg-muted overflow-auto rounded p-2 text-xs'>
                {JSON.stringify(errors, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h4 className='text-foreground mb-2 text-sm font-medium'>Form Values:</h4>
            <pre className='bg-muted overflow-auto rounded p-2 text-xs'>
              {JSON.stringify(values, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormDebugger;
