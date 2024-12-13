import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { BuildingIcon, CableCar, HomeIcon } from 'lucide-react';
import React from 'react';
import { useFormContext } from 'react-hook-form';

import { CreateListing } from '@/lib/prisma/schema';
import { cn } from '@/lib/utils';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function BasicInfoStep() {
  const { register, formState } = useFormContext<CreateListing>();
  const { errors } = formState;

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
          className='flex py-4 justify-between gap-4'
        >
          <PropertyTypeRadioButton
            value='apartment'
            Icon={BuildingIcon}
            label='Apartment'
          />
          <PropertyTypeRadioButton
            value='house'
            Icon={HomeIcon}
            label='House'
          />
          <PropertyTypeRadioButton
            value='unique'
            Icon={CableCar}
            label='Unique space'
          />
        </RadioGroup>
      </div>
    </div>
  );
}

function PropertyTypeRadioButton({
  value,
  Icon,
  label,
}: {
  value: string;
  Icon: React.ElementType;
  label: string;
}) {
  const { register, setValue, getValues } = useFormContext<CreateListing>();

  return (
    <div
      role='button'
      tabIndex={0}
      key={value}
      onClick={(e) => {
        e.preventDefault();
        setValue('propertyType', value, { shouldValidate: true });
      }}
      className={cn(
        'flex flex-col items-center justify-center gap-2 space-x-2 p-4 rounded-md border-2 border-transparent cursor-pointer',
        'min-w-36',
        {
          'border-border': getValues('propertyType') === value,
        },
      )}
    >
      <Label htmlFor={value} className='cursor-pointer'>
        <Icon size={48} />
      </Label>
      <RadioGroupItem value={value} id={value} {...register('propertyType')} />
      <Label htmlFor={value} className='text-sm text-center'>
        {label}
      </Label>
    </div>
  );
}
