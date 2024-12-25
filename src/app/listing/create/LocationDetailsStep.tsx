import React from 'react';
import { useFormContext } from 'react-hook-form';

import { CreateListing } from '@/lib/schema';

import { LocationPicker } from '@/components/LocationPicker';

export function LocationDetailsStep() {
  const { formState, setValue, watch, trigger } = useFormContext<CreateListing>();

  const address = watch('address');
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const showExactLocation = watch('showExactLocation');

  const handleAddressChange = async (newAddress: string) => {
    setValue('address', newAddress, { shouldValidate: true });
    return trigger('address');
  };

  const handleLocationChange = async (lat: number, lng: number) => {
    setValue('latitude', lat, { shouldValidate: true });
    setValue('longitude', lng, { shouldValidate: true });
    return trigger(['latitude', 'longitude']);
  };

  const handleShowExactLocationChange = async (show: boolean) => {
    setValue('showExactLocation', show, { shouldValidate: true });
    setValue('locationRadius', show ? 10 : 0, { shouldValidate: true });
    return trigger(['showExactLocation', 'locationRadius']);
  };

  return (
    <LocationPicker
      initialAddress={address || ''}
      initialLatitude={latitude}
      initialLongitude={longitude}
      initialShowExactLocation={showExactLocation}
      onAddressChange={handleAddressChange}
      onLocationChange={handleLocationChange}
      onShowExactLocationChange={handleShowExactLocationChange}
      errors={{
        address: formState.errors.address ? 'You must enter a valid address' : undefined,
      }}
    />
  );
}
