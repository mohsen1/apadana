import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import { CreateListing } from '@/lib/prisma/schema';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

import { amenitiesList } from '@/shared/ameneties';

export function AmenitiesStep() {
  const { control } = useFormContext<CreateListing>();

  return (
    <div className='space-y-4'>
      <Label>Amenities</Label>
      {amenitiesList.map((amenity) => (
        <div key={amenity} className='flex items-center space-x-2'>
          <Controller
            name='amenities'
            control={control}
            render={({ field }) => (
              <Checkbox
                id={`amenities-${amenity}`}
                checked={field.value?.includes(amenity)}
                onCheckedChange={(checked) => {
                  const updatedAmenities = checked
                    ? [...(field.value || []), amenity]
                    : (field.value || []).filter(
                        (item: string) => item !== amenity,
                      );
                  field.onChange(updatedAmenities);
                }}
              />
            )}
          />
          <Label htmlFor={`amenities-${amenity}`}>{amenity}</Label>
        </div>
      ))}
    </div>
  );
}
