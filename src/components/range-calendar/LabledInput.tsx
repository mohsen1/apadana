import React from 'react';

import { Input, InputProps } from '@/components/ui/input';

/**
 * prepends a label before the input such as
 *
 * **********************
 * | Label | Input      |
 * **********************
 */
export function LabledInput({
  label,
  ...props
}: InputProps & { label: React.ReactNode }) {
  return (
    <div className='flex flex-row items-center'>
      <span className='min-w-10 text-right pr-1'>{label}</span>
      <Input {...props} />
    </div>
  );
}
