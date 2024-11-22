'use client';

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
      !window.location.hostname.toLowerCase().includes('localhost')) ||
    !isVisible
  ) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-4 right-4 max-w-lg w-full bg-background border rounded-lg shadow-lg p-4 transition-all duration-200 ${
        isMinimized ? 'h-[40px] overflow-hidden' : 'max-h-[50vh] overflow-auto'
      } opacity-80 hover:opacity-100`}
    >
      <div className='flex justify-between items-center'>
        <h3 className='font-semibold'>Debug Information</h3>
        <div className='flex items-center space-x-2'>
          {!isMinimized && (
            <>
              <span className='text-xs px-2 py-1 rounded bg-muted'>
                Valid: {formState.isValid ? '✅' : '❌'}
              </span>
              <span className='text-xs px-2 py-1 rounded bg-muted'>
                Dirty: {formState.isDirty ? '✅' : '❌'}
              </span>
            </>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className='p-1 hover:bg-muted rounded-full transition-colors'
            aria-label={
              isMinimized ? 'Maximize debug panel' : 'Minimize debug panel'
            }
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className='p-1 hover:bg-muted rounded-full transition-colors'
            aria-label='Close debug panel'
          >
            ✕
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className='mt-4'>
          {Object.keys(errors).length > 0 && (
            <div className='mb-4'>
              <h4 className='text-sm font-medium text-destructive mb-2'>
                Validation Errors:
              </h4>
              <pre className='text-xs bg-muted p-2 rounded overflow-auto'>
                {JSON.stringify(errors, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h4 className='text-sm font-medium mb-2'>Form Values:</h4>
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
