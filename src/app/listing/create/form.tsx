'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import qs from 'qs';
import { useCallback, useEffect, useState } from 'react';
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
import FormDebugger from '@/app/listing/create/FormDebugger';
import logger from '@/utils/logger';

import { AmenitiesStep } from './AmenitiesStep';
import { BasicInfoStep } from './BasicInfoStep';
import { HouseRulesStep } from './HouseRulesStep';
import { LocationDetailsStep } from './LocationDetailsStep';
import { PhotosStep } from './PhotosStep';
import { PricingStep } from './PricingStep';
enum FormStep {
  LocationDetails = 0,
  BasicInfo = 1,
  Amenities = 2,
  Photos = 3,
  Pricing = 4,
  HouseRules = 5,
}
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

const stepRequiredFields = {
  [FormStep.LocationDetails]: ['address'],
  [FormStep.BasicInfo]: ['title', 'description', 'propertyType'],
  [FormStep.Amenities]: ['amenities'],
  [FormStep.Photos]: ['images'],
  [FormStep.Pricing]: ['pricePerNight', 'minimumStay', 'maximumGuests'],
  [FormStep.HouseRules]: ['houseRules'],
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

export default function CreateListingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<FormStep>(
    FormStep.LocationDetails,
  );
  const [showLoading, setShowLoading] = useState(false);

  const { execute, result } = useAction(createListing, {
    onError: (error) => {
      logger.error('create listing error', error);
    },
    onSuccess: (result) => {
      if (result.data?.success && result.data.listing) {
        router.push(
          `/listing/${result.data.listing.id}/manage/calendar?newListing=true`,
        );
      }
    },
  });

  const methods = useForm<CreateListing>({
    resolver: zodResolver(CreateListingSchema, {
      errorMap: (error, ctx) => {
        logger.error(error, ctx);
        return { message: ctx.defaultError ?? 'Unknown error' };
      },
    }),
    defaultValues,
  });

  const { handleSubmit, formState, getValues, reset } = methods;
  const { isSubmitting } = formState;

  const updateUrlParams = useCallback(
    ({
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
    },
    [searchParams, router],
  );

  useEffect(() => {
    const step = searchParams.get('step') || '0';
    if (step && Object.keys(FormStep).includes(step)) {
      setCurrentStep(parseInt(step, 10) as FormStep);
    } else {
      updateUrlParams({
        formData: defaultValues,
        step: FormStep.LocationDetails,
      });
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
    const booleanFields = ['showExactLocation'] as const;
    numericFields.forEach((field) => {
      if (field in formData && typeof formData[field] === 'string') {
        formData[field] = Number(formData[field]);
      }
    });
    if (formData.images) {
      formData.images = formData.images?.map((image) => {
        if (image.serverData) {
          delete image.serverData;
        }
        return {
          ...image,
          size: Number.parseInt(String(image.size), 10),
        };
      });
    }
    booleanFields.forEach((field) => {
      if (field in formData && typeof formData[field] === 'string') {
        formData[field] = formData[field] === 'true';
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
  }, [searchParams, router, reset, updateUrlParams]);

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
    const prevStepValue = Math.max(currentStep - 1, 0);
    updateUrlParams({
      formData: getValues(),
      step: prevStepValue,
    });
  };

  const canGoToNextStep = () => {
    if (currentStep === FormStep.Photos) {
      const { images } = getValues();
      // Check if there are any images and they all have file hash
      return (
        images && images.length > 0 && images.every((image) => !!image.fileHash)
      );
    }
    const requiredFields = stepRequiredFields[currentStep];
    const values = getValues();
    return requiredFields.every((field) => field in values);
  };

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (currentStep < steps.length - 1) {
        return;
      }

      // Set up loading state with throttle
      const loadingTimeout = setTimeout(() => {
        setShowLoading(true);
      }, 500);

      handleSubmit(
        async (data) => {
          updateUrlParams({
            formData: data,
            step: currentStep,
          });
          await execute(data);
          clearTimeout(loadingTimeout);
          setShowLoading(false);
        },
        (errors) => {
          logger.error('submit errors', errors);
          clearTimeout(loadingTimeout);
          setShowLoading(false);
        },
      )(e);
    },
    [currentStep, execute, handleSubmit, updateUrlParams],
  );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleFormSubmit}
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
            {currentStep !== FormStep.LocationDetails ? (
              <Button type='button' variant='outline' onClick={prevStep}>
                Previous
              </Button>
            ) : (
              <div className='w-4 opacity-0' />
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                type='button'
                onClick={nextStep}
                disabled={!canGoToNextStep()}
              >
                Next
              </Button>
            ) : (
              <Button
                type='submit'
                disabled={isSubmitting || showLoading}
                className='min-w-[100px]'
              >
                {isSubmitting || showLoading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Submitting...
                  </>
                ) : (
                  'Submit Listing'
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </form>
      <FormDebugger />
    </FormProvider>
  );
}
