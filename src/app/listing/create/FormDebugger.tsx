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
      className={`fixed bottom-4 right-4 max-w-lg w-full bg-gray-100 dark:bg-gray-800 border
         border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-1 transition-all 
         text-gray-900 dark:text-gray-100
         duration-200 ${
           isMinimized
             ? 'h-[40px] overflow-hidden'
             : 'max-h-[50vh] overflow-auto'
         } opacity-80 hover:opacity-100`}
    >
      <div className='flex justify-between items-center'>
        <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
          Debug Information
        </h3>
        <div className='flex items-center space-x-2'>
          {!isMinimized && (
            <>
              <span className='text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700'>
                Valid: {formState.isValid ? '✅' : '❌'}
              </span>
              <span className='text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700'>
                Dirty: {formState.isDirty ? '✅' : '❌'}
              </span>
            </>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className='p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors'
            aria-label={
              isMinimized ? 'Maximize debug panel' : 'Minimize debug panel'
            }
          >
            {isMinimized ? '□' : '−'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className='p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors'
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
              <h4 className='text-sm font-medium text-red-600 dark:text-red-400 mb-2'>
                Validation Errors:
              </h4>
              <pre className='text-xs text-gray-900 dark:text-gray-100 bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto'>
                {JSON.stringify(errors, null, 2)}
              </pre>
            </div>
          )}

          <div>
            <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-2'>
              Form Values:
            </h4>
            <pre className='text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto'>
              {JSON.stringify(values, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default FormDebugger;
