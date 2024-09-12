'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { getLocalTimeZone } from '@internationalized/date';
import { BuildingIcon, CableCar, HomeIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import qs from 'qs';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { CreateListing, CreateListingSchema } from '@/lib/prisma/schema';

import { ResultMessage } from '@/components/form/ResultMessage';
import { ImageUploader } from '@/components/image-uploader';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

import { createListing } from '@/app/listing/create/action';
import { amenitiesList } from '@/shared/ameneties';

const defaultValues: CreateListing = {
  userId: '',
  amenities: ['Wi-Fi'],
  title: 'My listing',
  description: 'This is a test listing',
  propertyType: 'house',
  address: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  zipCode: '94105',
  houseRules: 'No smoking allowed',
  pricePerNight: 100,
  minimumStay: 1,
  maximumGuests: 5,
  timeZone: getLocalTimeZone(),
};
enum FormStep {
  LocationDetails = 0,
  BasicInfo = 1,
  Amenities = 2,
  Photos = 3,
  Pricing = 4,
  HouseRules = 5,
}

export default function CreateListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<FormStep>(
    FormStep.LocationDetails,
  );

  const { execute, result } = useAction(createListing);
  const {
    register,
    handleSubmit,
    control,
    formState,
    getValues,
    setError,
    clearErrors,
    reset,
  } = useForm<CreateListing>({
    resolver: zodResolver(CreateListingSchema),
    defaultValues,
  });
  const { errors, isSubmitting } = formState;

  useEffect(() => {
    const step = parseInt(searchParams.get('step') || '1', 10) as FormStep;
    if (step && Object.values(FormStep).includes(step)) {
      setCurrentStep(step);
    } else {
      router.replace(`?step=${FormStep.LocationDetails}`);
    }

    const formData = qs.parse(
      searchParams.get('form-data') || '{}',
    ) as Partial<CreateListing>;
    // convert string values to numbers
    const numericFields = [
      'pricePerNight',
      'minimumStay',
      'maximumGuests',
    ] as const;
    numericFields.forEach((field) => {
      if (field in formData && typeof formData[field] === 'string') {
        formData[field] = Number(formData[field]);
      }
    });
    if (Object.keys(formData).length > 1) {
      try {
        const parsedData = CreateListingSchema.parse(formData);
        reset(parsedData);
      } catch {
        router.replace(`?step=${FormStep.LocationDetails}`);
        reset(defaultValues);
      }
    }
  }, [searchParams, router, reset]);

  const updateUrlParams = ({
    formData,
    step,
  }: {
    formData: Partial<CreateListing>;
    step: number;
  }) => {
    const params = new URLSearchParams(searchParams);
    const serialized = qs.stringify(formData);
    params.set('form-data', serialized);
    params.set('step', step.toString());
    router.push(`?${params.toString()}`);
  };

  const nextStep = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const currentValues = getValues();
    const nextStepValue = Math.min(
      currentStep + 1,
      Object.keys(FormStep).length / 2,
    );
    updateUrlParams({
      formData: currentValues,
      step: nextStepValue,
    });
  };

  const prevStep = () => {
    const prevStepValue = Math.max(currentStep - 1, 1);
    router.push(`?step=${prevStepValue}`);
  };

  const steps = [
    {
      title: 'Location Details',
      description: 'Enter the address and location information',
    },
    {
      title: 'Basic Information',
      description: 'Provide general details about your listing',
    },
    {
      title: 'Amenities',
      description: 'Select the amenities available at your property',
    },
    { title: 'Photos', description: 'Upload photos of your property' },
    {
      title: 'Pricing and Availability',
      description: 'Set your pricing and availability rules',
    },
    {
      title: 'House Rules',
      description: 'Establish house rules for your guests',
    },
  ];

  return (
    <form
      onSubmit={handleSubmit((data) => {
        updateUrlParams({
          formData: data,
          step: currentStep,
        });
        execute(data);
      })}
      className='max-w-4xl mx-auto p-6 space-y-8 flex-grow w-full'
    >
      <ResultMessage result={result} />

      <Card className='border-none shadow-none w-full'>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent className=''>
          {currentStep === FormStep.LocationDetails && (
            <div className='space-y-4'>
              <div>
                <Label htmlFor='address'>Street Address</Label>
                <Input
                  id='address'
                  {...register('address', { required: true })}
                />
                {errors.address && (
                  <span className='text-red-500'>This field is required</span>
                )}
              </div>
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
                <Input
                  id='zipCode'
                  {...register('zipCode', { required: true })}
                />
                {errors.zipCode && (
                  <span className='text-red-500'>This field is required</span>
                )}
              </div>
            </div>
          )}
          {currentStep === FormStep.BasicInfo && (
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
                      <CableCar className='' size={48} />
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
          )}
          {currentStep === FormStep.Amenities && (
            <div className='space-y-4'>
              <Label>Amenities</Label>
              {amenitiesList.map((amenity) => (
                <div key={amenity} className='flex items-center space-x-2'>
                  <Controller<CreateListing, 'amenities'>
                    name='amenities'
                    control={control}
                    render={({
                      field,
                    }: {
                      field: {
                        value: string[];
                        onChange: (value: string[]) => void;
                      };
                    }) => (
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
          )}

          {currentStep === FormStep.Photos && (
            <div className='space-y-4'>
              <Controller<CreateListing, 'images'>
                name='images'
                control={control}
                render={({ field }) => (
                  <ImageUploader
                    onChange={(images) => {
                      clearErrors('images');
                      field.onChange(images);
                    }}
                    onError={(error) => {
                      if (!error) {
                        clearErrors('images');
                        return;
                      }
                      setError('images', {
                        type: 'uploadError',
                        message:
                          error?.message ||
                          'Something went wrong while uploading the images',
                      });
                    }}
                  />
                )}
              />
              {errors.images && (
                <span className='text-red-500'>{errors.images.message}</span>
              )}
            </div>
          )}

          {currentStep === FormStep.Pricing && (
            <div className='space-y-4'>
              <div>
                <Label htmlFor='pricePerNight'>Price per Night ($)</Label>
                <Input
                  id='pricePerNight'
                  type='number'
                  {...register('pricePerNight', {
                    required: true,
                    min: 0,
                    setValueAs(value) {
                      return Number.parseInt(value, 10);
                    },
                  })}
                />
                {errors.pricePerNight && (
                  <span className='text-red-500'>
                    Please enter a valid price
                  </span>
                )}
              </div>
              <div>
                <Label htmlFor='minimumStay'>Minimum Stay (nights)</Label>
                <Input
                  id='minimumStay'
                  type='number'
                  {...register('minimumStay', {
                    required: true,
                    min: 1,
                    setValueAs(value) {
                      return Number.parseInt(value, 10);
                    },
                  })}
                />
                {errors.minimumStay && (
                  <span className='text-red-500'>
                    Please enter a valid number of nights
                  </span>
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
                    setValueAs(value) {
                      return Number.parseInt(value, 10);
                    },
                  })}
                />
                {errors.maximumGuests && (
                  <span className='text-red-500'>
                    Please enter a valid number of guests
                  </span>
                )}
              </div>
            </div>
          )}

          {currentStep === FormStep.HouseRules && (
            <div className='space-y-4'>
              <Label htmlFor='houseRules'>House Rules</Label>
              <Textarea id='houseRules' {...register('houseRules')} />
            </div>
          )}
        </CardContent>
        <CardFooter className='flex justify-between'>
          <Button
            type='button'
            variant='outline'
            onClick={prevStep}
            disabled={currentStep === FormStep.BasicInfo}
          >
            Previous
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button type='button' onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type='submit' disabled={isSubmitting}>
              Submit Listing
            </Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
