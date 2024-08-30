/* eslint-disable no-console */
'use client';

import { Listing } from '@prisma/client';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

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

import { ServerResponse, submitForm } from '@/app/listing/create/submit';
import { TypedFormData } from '@/utils/formData';
import { UploadButton } from '@/utils/uploadthing';

type Inputs = Omit<Listing, 'id'>;

const amenitiesList = [
  'Wi-Fi',
  'Kitchen',
  'Free parking',
  'Air conditioning',
  'Heating',
  'Washer',
  'Dryer',
  'TV',
  'Pool',
  'Hot tub',
];

export default function CreateListingForm() {
  const [currentStep, setCurrentStep] = useState(0);

  const [serverResponse, setServerResponse] = useState<ServerResponse | null>(
    null
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data);
    const formData = new FormData() as TypedFormData<Listing>;
    Object.entries(data).forEach(([key, value]) => {
      formData.append(
        // @ts-expect-error todo
        key,
        String(value)
      );
    });

    const result = await submitForm(formData);
    setServerResponse(result);
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

  const nextStep = () =>
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  if (serverResponse) {
    return (
      <div>
        {serverResponse.success ? 'Success!' : 'Error'}
        &nbsp;
        {serverResponse.error || ''}
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='max-w-4xl mx-auto p-6 space-y-8'
    >
      <div className='flex justify-between mb-8'>
        {steps.map((step, index) => (
          <div key={index} className='flex flex-col items-center'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= currentStep
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {index + 1}
            </div>
            <span className='text-xs mt-2'>{step.title}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 0 && (
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
          {currentStep === 1 && (
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
                <RadioGroup defaultValue='apartment'>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value='apartment'
                      id='apartment'
                      {...register('propertyType')}
                    />
                    <Label htmlFor='apartment'>Apartment</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <RadioGroupItem
                      value='house'
                      id='house'
                      {...register('propertyType')}
                    />
                    <Label htmlFor='house'>House</Label>
                  </div>
                  <div className='flex items-center space-x-2'>
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
          {currentStep === 2 && (
            <div className='space-y-4'>
              <Label>Amenities</Label>
              {amenitiesList.map((amenity) => (
                <div key={amenity} className='flex items-center space-x-2'>
                  <Checkbox id={amenity} {...register('amenities')} />
                  <Label htmlFor={amenity}>{amenity}</Label>
                </div>
              ))}
            </div>
          )}

          {currentStep === 3 && (
            <div className='space-y-4'>
              <Label htmlFor='photos'>Upload Photos</Label>
              <UploadButton
                endpoint='imageUploader'
                onClientUploadComplete={(res) => {
                  // Do something with the response
                  // eslint-disable-next-line no-console
                  console.log('Files: ', res);
                  alert('Upload Completed');
                }}
                onUploadError={(error: Error) => {
                  // Do something with the error.
                  alert(`ERROR! ${error.message}`);
                }}
              />
            </div>
          )}

          {currentStep === 4 && (
            <div className='space-y-4'>
              <div>
                <Label htmlFor='pricePerNight'>Price per Night ($)</Label>
                <Input
                  id='pricePerNight'
                  type='number'
                  {...register('pricePerNight', { required: true, min: 0 })}
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
                  {...register('minimumStay', { required: true, min: 1 })}
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
                  {...register('maximumGuests', { required: true, min: 1 })}
                />
                {errors.maximumGuests && (
                  <span className='text-red-500'>
                    Please enter a valid number of guests
                  </span>
                )}
              </div>
            </div>
          )}

          {currentStep === 5 && (
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
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button type='button' onClick={nextStep}>
              Next
            </Button>
          ) : (
            <Button type='submit'>Submit Listing</Button>
          )}
        </CardFooter>
      </Card>
    </form>
  );
}
