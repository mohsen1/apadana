import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { BuildingIcon, CableCar, HomeIcon } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { CreateListing } from '@/lib/prisma/schema';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function BasicInfoStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<CreateListing>();

  return (
    <div className='space-y-4'>
      <div>
        <Label htmlFor='title'>Listing Title</Label>
        <Input id='title' {...register('title', { required: true })} />
        {errors.title && (
          <span className='text-red-500'>This field is required</span>
        )}
      </div>
      <div>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          {...register('description', { required: true })}
        />
        {errors.description && (
          <span className='text-red-500'>This field is required</span>
        )}
      </div>
      <div>
        <Label>Property Type</Label>
        <RadioGroup
          defaultValue='apartment'
          className='grid grid-cols-3 gap-2 py-4'
        >
          <div className='flex flex-col items-center gap-2 space-x-2'>
            <Label htmlFor='apartment' className='cursor-pointer'>
              <BuildingIcon size={48} />
            </Label>
            <RadioGroupItem
              value='apartment'
              id='apartment'
              {...register('propertyType')}
            />
            <Label htmlFor='apartment'>Apartment</Label>
          </div>
          <div className='flex flex-col items-center gap-2 space-x-2'>
            <Label htmlFor='house' className='cursor-pointer'>
              <HomeIcon size={48} />
            </Label>
            <RadioGroupItem
              value='house'
              id='house'
              {...register('propertyType')}
            />
            <Label htmlFor='house'>House</Label>
          </div>
          <div className='flex flex-col items-center gap-2 space-x-2'>
            <Label htmlFor='unique' className='cursor-pointer'>
              <CableCar size={48} />
            </Label>
            <RadioGroupItem
              value='unique'
              id='unique'
              {...register('propertyType')}
            />
            <Label htmlFor='unique'>Unique space</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
