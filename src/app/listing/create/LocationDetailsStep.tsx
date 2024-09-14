// LocationDetailsStep.tsx

import React from 'react';
import { useFormContext } from 'react-hook-form';

import { CreateListing } from '@/lib/prisma/schema';

import { LocationPicker } from '@/components/LocationPicker';

export function LocationDetailsStep() {
  const {
    formState: { errors },
    setValue,
    getValues,
  } = useFormContext<CreateListing>();

  const handleAddressChange = (address: string) => {
    setValue('address', address);
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setValue('latitude', lat);
    setValue('longitude', lng);
  };

  const handleShowExactLocationChange = (showExactLocation: boolean) => {
    setValue('showExactLocation', showExactLocation);
  };

  const values = getValues();

  return (
    <LocationPicker
      initialAddress={values.address || ''}
      initialLatitude={values.latitude}
      initialLongitude={values.longitude}
      initialShowExactLocation={values.showExactLocation}
      onAddressChange={handleAddressChange}
      onLocationChange={handleLocationChange}
      onShowExactLocationChange={handleShowExactLocationChange}
      errors={{
        address: errors.address ? 'This field is required' : undefined,
      }}
    />
  );
}
