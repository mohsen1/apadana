import React from 'react';
import { useFormContext } from 'react-hook-form';

import { CreateListing } from '@/lib/prisma/schema';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function PricingStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateListing>();

  return (
    <div className='space-y-4'>
      <div>
        <Label htmlFor='pricePerNight'>Price per Night ($)</Label>
        <Input
          id='pricePerNight'
          type='number'
          {...register('pricePerNight', {
            required: true,
            min: 0,
            setValueAs: (value: string) => Number.parseInt(value, 10),
          })}
        />
        {errors.pricePerNight && <span className='text-red-500'>Please enter a valid price</span>}
      </div>
      <div>
        <Label htmlFor='minimumStay'>Minimum Stay (nights)</Label>
        <Input
          id='minimumStay'
          type='number'
          {...register('minimumStay', {
            required: true,
            min: 1,
            setValueAs: (value: string) => Number.parseInt(value, 10),
          })}
        />
        {errors.minimumStay && (
          <span className='text-red-500'>Please enter a valid number of nights</span>
        )}
      </div>
      <div>
        <Label htmlFor='maximumGuests'>Maximum Guests</Label>
        <Input
          id='maximumGuests'
          type='number'
          {...register('maximumGuests', {
            required: true,
            min: 1,
            setValueAs: (value: string) => Number.parseInt(value, 10),
          })}
        />
        {errors.maximumGuests && (
          <span className='text-red-500'>Please enter a valid number of guests</span>
        )}
      </div>
    </div>
  );
}
