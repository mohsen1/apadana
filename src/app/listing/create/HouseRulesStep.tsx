import React from 'react';
import { useFormContext } from 'react-hook-form';

import { CreateListing } from '@/lib/schema';

import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function HouseRulesStep({ disabled }: { disabled: boolean }) {
  const { register } = useFormContext<CreateListing>();

  return (
    <div className='space-y-4'>
      <Label htmlFor='houseRules'>House Rules</Label>
      <Textarea id='houseRules' {...register('houseRules')} disabled={disabled} />
    </div>
  );
}
