'use server';

import { Listing } from '@prisma/client';

import { getUserInServer } from '@/lib/auth';

import { createListing } from '@/app/listing/create/action';
import { TypedFormData } from '@/utils/formData';

export type ServerResponse = {
  listing?: Listing;
};

function validateFormData(
  formData: TypedFormData<Listing>,
): formData is TypedFormData<Required<Listing>> {
  const errors: Record<string, string> = {};
  const validatedData: Record<string, string | number | string[] | boolean | Date> = {};

  // Define required fields
  const requiredFields: (keyof Listing)[] = [
    'title',
    'description',
    'propertyType',
    'address',
    'pricePerNight',
    'minimumStay',
    'maximumGuests',
  ];

  // Validate required fields
  for (const field of requiredFields) {
    const value = formData.get<typeof field>(field);
    if (value === null || value === undefined) {
      errors[field] = `${field} is required`;
    } else {
      validatedData[field] = value;
    }
  }

  // Validate and convert numeric fields
  const numericFields: (keyof Pick<Listing, 'pricePerNight' | 'minimumStay' | 'maximumGuests'>)[] =
    ['pricePerNight', 'minimumStay', 'maximumGuests'];
  for (const field of numericFields) {
    const value = formData.get(field);
    if (value) {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        errors[field] = `${field} must be a number`;
      } else {
        validatedData[field] = numValue;
      }
    }
  }

  // Handle optional fields
  const amenities = formData.getAll('amenities');
  if (amenities.length > 0) {
    validatedData.amenities = amenities;
  } else {
    validatedData.amenities = [];
  }

  const houseRules = formData.get('houseRules');
  if (houseRules) {
    validatedData.houseRules = houseRules;
  } else {
    validatedData.houseRules = '';
  }

  if (Object.keys(errors).length > 0) {
    throw new Error(JSON.stringify(errors));
  }

  return true;
}

export async function submitForm(formData: TypedFormData<Listing>): Promise<ServerResponse> {
  validateFormData(formData);

  const user = await getUserInServer();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const res = await createListing({
    title: formData.get('title'),
    description: formData.get('description'),
    propertyType: formData.get('propertyType'),
    address: formData.get('address'),
    amenities: formData.getAll('amenities'),
    // @ts-expect-error todo
    pricePerNight: parseFloat(formData.get('pricePerNight') || '0'),
    // @ts-expect-error todo
    minimumStay: parseInt(formData.get('minimumStay'), 10),
    // @ts-expect-error todo
    maximumGuests: parseInt(formData.get('maximumGuests')),
    houseRules: formData.get('houseRules'),
    latitude: formData.get('latitude') ?? 0,
    longitude: formData.get('longitude') ?? 0,
  });

  return { listing: res?.data?.listing };
}
