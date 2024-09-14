'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import qs from 'qs';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { CreateListing, CreateListingSchema } from '@/lib/prisma/schema';

import { ResultMessage } from '@/components/form/ResultMessage';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { createListing } from '@/app/listing/create/action';

import { AmenitiesStep } from './AmenitiesStep';
import { BasicInfoStep } from './BasicInfoStep';
import { HouseRulesStep } from './HouseRulesStep';
import { LocationDetailsStep } from './LocationDetailsStep';
import { PhotosStep } from './PhotosStep';
import { PricingStep } from './PricingStep';

const defaultValues: Omit<CreateListing, 'latitude' | 'longitude' | 'address'> =
  {
    amenities: ['Wi-Fi'],
    title: 'My listing',
    description: 'This is a test listing',
    propertyType: 'house',
    houseRules: 'No smoking allowed',
    pricePerNight: 100,
    minimumStay: 1,
    maximumGuests: 5,
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

  const methods = useForm<CreateListing>({
    resolver: zodResolver(CreateListingSchema),
    defaultValues,
  });

  const { handleSubmit, formState, getValues, reset } = methods;
  const { isSubmitting } = formState;

  useEffect(() => {
    const step = parseInt(searchParams.get('step') || '0', 10) as FormStep;
    if (step && Object.values(FormStep).includes(step)) {
      setCurrentStep(step);
    } else {
      router.replace(`?step=${FormStep.LocationDetails}`);
    }

    const formData = qs.parse(
      searchParams.get('form-data') || '{}',
    ) as Partial<CreateListing>;

    // Convert string values to numbers
    const numericFields = [
      'pricePerNight',
      'minimumStay',
      'maximumGuests',
      'latitude',
      'longitude',
    ] as const;
    numericFields.forEach((field) => {
      if (field in formData && typeof formData[field] === 'string') {
        formData[field] = Number(formData[field]);
      }
    });
    if (Object.keys(formData).length > 1) {
      try {
        const parsedData = CreateListingSchema.partial().parse(formData);
        reset(parsedData);
      } catch (error) {
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
      Object.keys(FormStep).length,
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

  return (
    <FormProvider {...methods}>
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
          <CardContent>
            {currentStep === FormStep.LocationDetails && (
              <LocationDetailsStep />
            )}
            {currentStep === FormStep.BasicInfo && <BasicInfoStep />}
            {currentStep === FormStep.Amenities && <AmenitiesStep />}
            {currentStep === FormStep.Photos && <PhotosStep />}
            {currentStep === FormStep.Pricing && <PricingStep />}
            {currentStep === FormStep.HouseRules && <HouseRulesStep />}
          </CardContent>
          <CardFooter className='flex justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={prevStep}
              disabled={currentStep === FormStep.LocationDetails}
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
    </FormProvider>
  );
}
