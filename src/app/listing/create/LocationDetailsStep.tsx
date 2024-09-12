import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { CreateListing } from '@/lib/prisma/schema';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LocationDetailsStepProps {
  isLoaded: boolean;
  loadError: Error | undefined;
}

export function LocationDetailsStep({
  isLoaded,
  loadError,
}: LocationDetailsStepProps) {
  const {
    register,
    formState: { errors },
    setValue,
  } = useFormContext<CreateListing>();

  const [addressInput, setAddressInput] = useState('');
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAddressInput(value);

    if (!value) {
      setPredictions([]);
      return;
    }

    const service = new google.maps.places.AutocompleteService();
    service.getPlacePredictions({ input: value }, (predictions, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
        setPredictions(predictions);
      } else {
        setPredictions([]);
      }
    });
  };

  const handleSelectPrediction = (
    prediction: google.maps.places.AutocompletePrediction,
  ) => {
    setAddressInput(prediction.description);
    setPredictions([]);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: prediction.place_id }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
        const addressComponents = results[0].address_components;
        let street = '';
        let city = '';
        let state = '';
        let zipCode = '';

        addressComponents.forEach((component) => {
          const types = component.types;
          if (types.includes('street_number')) {
            street = `${component.long_name} ${street}`;
          }
          if (types.includes('route')) {
            street += component.long_name;
          }
          if (types.includes('locality')) {
            city = component.long_name;
          }
          if (types.includes('administrative_area_level_1')) {
            state = component.short_name;
          }
          if (types.includes('postal_code')) {
            zipCode = component.long_name;
          }
        });

        // Update form fields
        setValue('address', street);
        setValue('city', city);
        setValue('state', state);
        setValue('zipCode', zipCode);

        // Get latitude and longitude
        const location = results[0].geometry?.location;
        if (location) {
          const lat = location.lat();
          const lng = location.lng();
          setValue('latitude', lat);
          setValue('longitude', lng);
        }
      }
    });
  };

  if (loadError) {
    throw new Error(`Failed to load Google Maps API: ${loadError}`);
  }

  return (
    <div className='space-y-4'>
      {!isLoaded ? (
        <Loader2 className='animate-spin' />
      ) : (
        <div className='relative'>
          <Label htmlFor='address'>Street Address</Label>
          <Input
            id='address'
            value={addressInput}
            onChange={handleAddressChange}
            placeholder='Enter your address'
          />
          {errors.address && (
            <span className='text-red-500'>This field is required</span>
          )}
          {predictions.length > 0 && (
            <ul className='absolute z-10 w-full bg-white border rounded-md mt-1 shadow-lg'>
              {predictions.map((prediction) => (
                <li
                  key={prediction.place_id}
                  className='px-4 py-2 hover:bg-gray-100 cursor-pointer'
                  onClick={() => handleSelectPrediction(prediction)}
                >
                  {prediction.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div>
        <Label htmlFor='city'>City</Label>
        <Input id='city' {...register('city', { required: true })} />
        {errors.city && (
          <span className='text-red-500'>This field is required</span>
        )}
      </div>
      <div>
        <Label htmlFor='state'>State</Label>
        <Input id='state' {...register('state', { required: true })} />
        {errors.state && (
          <span className='text-red-500'>This field is required</span>
        )}
      </div>
      <div>
        <Label htmlFor='zipCode'>Zip Code</Label>
        <Input id='zipCode' {...register('zipCode', { required: true })} />
        {errors.zipCode && (
          <span className='text-red-500'>This field is required</span>
        )}
      </div>
    </div>
  );
}
