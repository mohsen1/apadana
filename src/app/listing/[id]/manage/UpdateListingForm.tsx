'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Listing } from '@prisma/client';
import { Clock, DollarSign, Loader2, SaveIcon, Users } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { Controller, useForm } from 'react-hook-form';

import { CreateListingSchemaWithCoercion } from '@/lib/schema';

import { DisappearingComponent } from '@/components/DisappearingComponent';
import { LocationPicker } from '@/components/LocationPicker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { editListing } from '@/app/listing/[id]/manage/action';

const EditListingSchema = CreateListingSchemaWithCoercion;

export default function UpdateListingForm({ listing }: { listing: Listing }) {
  const { register, handleSubmit, formState, setValue, control } = useForm<Partial<Listing>>({
    defaultValues: listing,
    resolver: zodResolver(EditListingSchema),
  });
  const { execute, status } = useAction(editListing, {});
  const { errors, isSubmitting } = formState;
  return (
    <Card className='box-shadow-none border-none'>
      <CardHeader>
        <CardTitle>Listing Details</CardTitle>
        <CardDescription>Edit your listing information</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className='space-y-4'
          onSubmit={handleSubmit((data) => {
            execute({
              ...data,
              id: listing.id,
              latitude: data.latitude ?? undefined,
              longitude: data.longitude ?? undefined,
              showExactLocation: data.showExactLocation ?? undefined,
            });
          })}
        >
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Title</Label>
              <Input {...register('title')} id='title' placeholder='Enter listing title' />
              {errors.title && <p className='text-destructive'>{errors.title.message}</p>}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='propertyType'>Property Type</Label>
              <Input
                {...register('propertyType')}
                id='propertyType'
                placeholder='e.g. Apartment, House'
              />
              {errors.propertyType && (
                <p className='text-destructive'>{errors.propertyType.message}</p>
              )}
            </div>
            <div className='col-span-2 space-y-2'>
              <LocationPicker
                onAddressChange={(address) => {
                  setValue('address', address);
                }}
                onLocationChange={(lat, lng) => {
                  setValue('latitude', lat);
                  setValue('longitude', lng);
                }}
                onShowExactLocationChange={(showExactLocation) => {
                  setValue('showExactLocation', showExactLocation);
                }}
                initialAddress={listing.address}
                initialLatitude={listing.latitude ?? undefined}
                initialLongitude={listing.longitude ?? undefined}
                initialShowExactLocation={listing.showExactLocation ?? undefined}
              />
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              {...register('description')}
              id='description'
              placeholder='Describe your listing'
            />
            {errors.description && <p className='text-destructive'>{errors.description.message}</p>}
          </div>
          <div>
            {/* TODO: Handle localization here. 
            It should be able to show 24 hour and 23 hour time formats */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='checkInTime'>Check-in Time</Label>
                <div className='relative'>
                  <Clock className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
                  <Input
                    {...register('checkInTime', {
                      pattern: {
                        value: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
                        message: 'Please enter time in HH:MM format',
                      },
                    })}
                    id='checkInTime'
                    className='pl-8'
                    placeholder='14:00'
                  />
                </div>
                {errors.checkInTime && (
                  <p className='text-destructive'>{errors.checkInTime.message}</p>
                )}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='checkOutTime'>Check-out Time</Label>
                <div className='relative'>
                  <Clock className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
                  <Input
                    {...register('checkOutTime', {
                      pattern: {
                        value: /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
                        message: 'Please enter time in HH:MM format',
                      },
                    })}
                    id='checkOutTime'
                    className='pl-8'
                    placeholder='11:00'
                  />
                </div>
                {errors.checkOutTime && (
                  <p className='text-destructive'>{errors.checkOutTime.message}</p>
                )}
              </div>
            </div>
          </div>
          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='pricePerNight'>Price per Night</Label>
              <div className='relative'>
                <DollarSign className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
                <Input
                  {...register('pricePerNight', { valueAsNumber: true })}
                  id='pricePerNight'
                  type='number'
                  className='pl-8'
                  placeholder='0.00'
                />
              </div>
              {errors.pricePerNight && (
                <p className='text-destructive'>{errors.pricePerNight.message}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='minimumStay'>Minimum Stay (nights)</Label>
              <div className='relative'>
                <Clock className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
                <Input
                  {...register('minimumStay', { valueAsNumber: true })}
                  id='minimumStay'
                  type='number'
                  className='pl-8'
                  placeholder='1'
                />
              </div>
              {errors.minimumStay && (
                <p className='text-destructive'>{errors.minimumStay.message}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='maximumGuests'>Maximum Guests</Label>
              <div className='relative'>
                <Users className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
                <Input
                  {...register('maximumGuests', {
                    valueAsNumber: true,
                  })}
                  id='maximumGuests'
                  type='number'
                  className='pl-8'
                  placeholder='1'
                />
              </div>
              {errors.maximumGuests && (
                <p className='text-destructive'>{errors.maximumGuests.message}</p>
              )}
            </div>
          </div>
          <div className='space-y-2'>
            <Label htmlFor='houseRules'>House Rules</Label>
            <Textarea {...register('houseRules')} id='houseRules' placeholder='Enter house rules' />
            {errors.houseRules && <p className='text-destructive'>{errors.houseRules.message}</p>}
          </div>
          <Controller
            name='published'
            control={control}
            render={({ field }) => (
              <div className='flex items-center space-x-2'>
                <Switch
                  checked={field.value || false}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                  }}
                  id='published'
                />
                <Label htmlFor='published'>Published</Label>
              </div>
            )}
          />
          {errors.published && <p className='text-destructive'>{errors.published.message}</p>}
          <div className='flex items-center justify-start'>
            <Button
              disabled={isSubmitting || !formState.isValid || !formState.isDirty}
              type='submit'
              className='flex items-center gap-2'
            >
              {status === 'executing' ? (
                <>
                  <Loader2 />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <SaveIcon />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
            {formState.isSubmitSuccessful && !formState.isSubmitting && (
              <DisappearingComponent disappearIn={3} className='mx-2 text-green-600'>
                Your changes have been saved
              </DisappearingComponent>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
