'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import { useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import {
  CreateListingSchema,
  CreateListingSchemaWithCoercion,
  CreateListingWithCoercion,
} from '@/lib/schema';
import { StepConfig, useFormStepper } from '@/hooks/useFormStepper';

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
import FormDebugger from '@/app/listing/create/FormDebugger';
import logger from '@/utils/logger';

import { AmenitiesStep } from './AmenitiesStep';
import { BasicInfoStep } from './BasicInfoStep';
import { HouseRulesStep } from './HouseRulesStep';
import { LocationDetailsStep } from './LocationDetailsStep';
import { PhotosStep } from './PhotosStep';
import { PricingStep } from './PricingStep';

const defaultValues: Omit<CreateListingWithCoercion, 'latitude' | 'longitude' | 'address'> = {
  amenities: ['Wi-Fi'],
  title: 'My listing',
  description: 'This is a test listing',
  propertyType: 'house',
  houseRules: 'No smoking allowed',
  pricePerNight: 100,
  minimumStay: 1,
  maximumGuests: 5,
  slug: '',
  timeZone: 'UTC',
  checkInTime: '15:00',
  checkOutTime: '11:00',
  currency: 'USD',
  allowPets: false,
  petPolicy: '',
  published: false,
  showExactLocation: true,
  locationRadius: 0,
  images: [],
};

const steps: StepConfig<CreateListingWithCoercion>[] = [
  {
    title: 'Where is your property?',
    description:
      'Enter the address and location information. ' +
      'You can choose to hide the exact location of your property on your website and show an estimate location',
    validation: CreateListingSchemaWithCoercion.pick({
      address: true,
      latitude: true,
      longitude: true,
      locationRadius: true,
    }),
  },
  {
    title: 'What kind of property is it?',
    description: 'Provide general details about your listing',
    validation: CreateListingSchemaWithCoercion.pick({
      title: true,
      description: true,
      propertyType: true,
    }),
  },
  {
    title: 'What amenities are available?',
    description: 'Select the amenities available at your property',
    validation: CreateListingSchemaWithCoercion.pick({
      amenities: true,
    }),
  },
  {
    title: 'Photos',
    description: 'Upload photos of your property',
    validation: CreateListingSchemaWithCoercion.pick({
      images: true,
    }),
  },
  {
    title: 'Set your pricing',
    description: 'Set your pricing and availability rules',
    validation: CreateListingSchemaWithCoercion.pick({
      pricePerNight: true,
      minimumStay: true,
      maximumGuests: true,
    }),
  },
  {
    title: 'Set your rules',
    description: 'Establish house rules for your guests',
    validation: CreateListingSchemaWithCoercion.pick({
      houseRules: true,
    }),
  },
];

export default function CreateListingForm() {
  const router = useRouter();

  const { execute, result, isPending } = useAction(createListing, {
    onError: (error) => {
      logger.error('create listing error', error);
    },
    onSuccess: (result) => {
      logger.info('create listing success', result);
      if (result.data) {
        window.location.href = `/listing/${result.data.id}/manage/calendar?newListing=true`;
      } else {
        logger.error('no listing returned from create listing', result);
        router.replace(`/listings`);
      }
    },
  });

  const form = useForm<CreateListingWithCoercion>({
    resolver: zodResolver(CreateListingSchemaWithCoercion),
    defaultValues,
  });

  const {
    currentStep,
    currentStepConfig,
    isFirstStep,
    isLastStep,
    canGoNext,
    nextStep,
    previousStep,
  } = useFormStepper({
    steps,
    form,
    defaultValues,
    paramPrefix: 'listing-create',
  });

  const handleFormSubmit = useCallback(
    async (data: CreateListingWithCoercion) => {
      const coerced = CreateListingSchemaWithCoercion.parse(data);
      const parsed = CreateListingSchema.parse(coerced);
      execute(parsed);
    },
    [isLastStep, nextStep, execute],
  );

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className='mx-auto w-full max-w-4xl flex-grow space-y-8'
      >
        {process.env.NODE_ENV === 'development' && <ResultMessage result={result} />}

        <Card className='w-full border-none bg-transparent shadow-none'>
          <CardHeader>
            <CardTitle>{currentStepConfig.title}</CardTitle>
            <CardDescription>{currentStepConfig.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && <LocationDetailsStep />}
            {currentStep === 1 && <BasicInfoStep />}
            {currentStep === 2 && <AmenitiesStep />}
            {currentStep === 3 && <PhotosStep />}
            {currentStep === 4 && <PricingStep />}
            {currentStep === 5 && <HouseRulesStep disabled={isPending} />}
          </CardContent>
          <CardFooter className='flex justify-between'>
            {!isFirstStep ? (
              <Button type='button' variant='outline' onClick={previousStep}>
                Previous
              </Button>
            ) : (
              <div className='w-4 opacity-0' />
            )}
            <Button
              type='submit'
              disabled={(!isLastStep && !canGoNext()) || isPending}
              className='min-w-[100px]'
              onClick={(event) => {
                if (!isLastStep) {
                  event.preventDefault();
                  nextStep();
                  return;
                }
              }}
            >
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Submitting...
                </>
              ) : isLastStep ? (
                'Submit Listing'
              ) : (
                'Next'
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
      <FormDebugger />
    </FormProvider>
  );
}
