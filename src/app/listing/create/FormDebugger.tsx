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
      className={`fixed bottom-4 right-4 max-w-lg w-full bg-background border
         border-border rounded-lg shadow-lg p-1 transition-all 
         text-foreground
         duration-200 ${isMinimized ? 'h-12' : 'h-96'}`}
    >
      <div className='flex justify-between items-center'>
        <h3 className='font-semibold text-foreground'>Debug Information</h3>
        <div className='flex gap-2'>
          <span className='text-xs px-2 py-1 rounded bg-muted'>
            Valid: {formState.isValid ? '✅' : '❌'}
          </span>
          <span className='text-xs px-2 py-1 rounded bg-muted'>
            Dirty: {formState.isDirty ? '✅' : '❌'}
          </span>
        </div>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className='p-1 hover:bg-accent rounded-full transition-colors'
        >
          {isMinimized ? <ChevronUp /> : <ChevronDown />}
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className='p-1 hover:bg-accent rounded-full transition-colors'
        >
          <X />
        </button>
      </div>

      {!isMinimized && (
        <div className='overflow-auto h-[calc(100%-2rem)] p-2'>
          {Object.keys(errors).length > 0 && (
            <div className='mb-4'>
              <h4 className='text-sm font-medium text-destructive mb-2'>
                Validation Errors:
              </h4>
              <pre className='text-xs text-foreground bg-muted p-2 rounded overflow-auto'>
                {JSON.stringify(errors, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h4 className='text-sm font-medium text-foreground mb-2'>
              Form Values:
            </h4>
            <pre className='text-xs bg-muted p-2 rounded overflow-auto'>
              {JSON.stringify(values, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormDebugger;
