'use client';

import { TimeField } from '@adobe/react-spectrum';
import { zodResolver } from '@hookform/resolvers/zod';
import { Time } from '@internationalized/date';
import { Listing } from '@prisma/client';
import {
  Building2,
  Clock,
  DollarSign,
  Eye,
  Home,
  Info,
  Loader2,
  MapPin,
  SaveIcon,
  Shield,
  Users,
} from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { Controller, useForm } from 'react-hook-form';

import { CreateListingSchemaWithCoercion } from '@/lib/schema';
import { cn } from '@/lib/utils';

import { DisappearingComponent } from '@/components/common/DisappearingComponent';
import { SpectrumProvider } from '@/components/common/SpectrumProvider';
import { LocationPicker } from '@/components/LocationPicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { editListing } from '@/app/listing/[id]/manage/action';
import { stringToTime } from '@/utils/time';
import { TimeString } from '@/utils/time';

const EditListingSchema = CreateListingSchemaWithCoercion;

interface FormSection {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const sections: Record<string, FormSection> = {
  basic: {
    icon: <Home className='h-8 w-8' />,
    title: 'Basic Information',
    description: 'Essential details about your property',
  },
  location: {
    icon: <MapPin className='h-8 w-8' />,
    title: 'Location',
    description: 'Where your property is located',
  },
  details: {
    icon: <Info className='h-8 w-8' />,
    title: 'Property Details',
    description: 'Specific information about your property',
  },
  rules: {
    icon: <Shield className='h-8 w-8' />,
    title: 'Rules & Policies',
    description: 'Set your house rules and policies',
  },
  visibility: {
    icon: <Eye className='h-8 w-8' />,
    title: 'Visibility Settings',
    description: 'Control who can see and book your property',
  },
};

export default function UpdateListingForm({ listing }: { listing: Listing }) {
  const { register, handleSubmit, formState, setValue, getValues, control } = useForm<
    Partial<Listing>
  >({
    defaultValues: listing,
    resolver: zodResolver(EditListingSchema),
  });

  const { execute, status } = useAction(editListing, {});
  const { errors, isSubmitting } = formState;

  return (
    <SpectrumProvider>
      <form
        className='space-y-6'
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
        <div className='lg:mg-0 mx-2 grid gap-6'>
          {/* Basic Information Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              {sections.basic.icon}
              <div>
                <h2 className='text-lg font-semibold'>{sections.basic.title}</h2>
                <p className='text-muted-foreground text-sm'>{sections.basic.description}</p>
              </div>
            </div>

            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label htmlFor='title'>Title</Label>
                <Input {...register('title')} id='title' placeholder='Enter listing title' />
                {errors.title && <p className='text-destructive text-sm'>{errors.title.message}</p>}
              </div>
              <div className='space-y-2'>
                <Label htmlFor='propertyType'>Property Type</Label>
                <div className='relative'>
                  <Building2 className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
                  <Input
                    {...register('propertyType')}
                    id='propertyType'
                    className='pl-8'
                    placeholder='e.g. Apartment, House'
                  />
                </div>
                {errors.propertyType && (
                  <p className='text-destructive text-sm'>{errors.propertyType.message}</p>
                )}
              </div>
            </div>
            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                {...register('description')}
                id='description'
                placeholder='Describe your listing'
                className='min-h-[100px]'
              />
              {errors.description && (
                <p className='text-destructive text-sm'>{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Location Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              {sections.location.icon}
              <div>
                <h2 className='text-lg font-semibold'>{sections.location.title}</h2>
                <p className='text-muted-foreground text-sm'>{sections.location.description}</p>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div className='space-y-0.5'>
                  <Label htmlFor='showExactLocation'>Exact Location</Label>
                  <p className='text-muted-foreground text-sm'>
                    When enabled, guests can see the exact location of your property on the listing
                    page
                  </p>
                </div>
                <Controller
                  name='showExactLocation'
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                      id='showExactLocation'
                    />
                  )}
                />
              </div>
              {errors.showExactLocation && (
                <p className='text-destructive text-sm'>{errors.showExactLocation.message}</p>
              )}
            </div>

            <LocationPicker
              showExactLocationSwitch={false}
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

          {/* Details Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              {sections.details.icon}
              <div>
                <h2 className='text-lg font-semibold'>{sections.details.title}</h2>
                <p className='text-muted-foreground text-sm'>{sections.details.description}</p>
              </div>
            </div>

            <div className='grid gap-6'>
              <h4 className='text-lg font-semibold'>Check-in & Check-out</h4>
              <div className='grid grid-cols-2 gap-4'>
                <div className='flex flex-col gap-2 space-y-2'>
                  <Label htmlFor='checkInTime'>Check-in Time</Label>
                  <Controller
                    name='checkInTime'
                    control={control}
                    render={({ field }) => (
                      <TimeField
                        aria-label='Check-in time'
                        UNSAFE_style={{ width: '125px' }}
                        granularity='minute'
                        value={stringToTime(field.value as TimeString) ?? new Time(0, 0)}
                        onChange={(time) => {
                          if (time) {
                            field.onChange(`${time.hour}:${time.minute}`);
                          }
                        }}
                      />
                    )}
                  />
                  {errors.checkInTime && (
                    <p className='text-destructive text-sm'>{errors.checkInTime.message}</p>
                  )}
                </div>
                <div className='flex flex-col gap-2 space-y-2'>
                  <Label htmlFor='checkOutTime'>Check-out Time</Label>
                  <Controller
                    name='checkOutTime'
                    control={control}
                    render={({ field }) => (
                      <TimeField
                        aria-label='Check-out time'
                        granularity='minute'
                        UNSAFE_style={{ width: '125px' }}
                        value={stringToTime(field.value as TimeString) ?? new Time(0, 0)}
                        onChange={(time) => {
                          if (time) {
                            const timeString = `${time.hour}:${time.minute}` as const;
                            field.onChange(timeString);
                          }
                        }}
                      />
                    )}
                  />
                  {errors.checkOutTime && (
                    <p className='text-destructive text-sm'>{errors.checkOutTime.message}</p>
                  )}
                </div>
              </div>
              <h4 className='text-lg font-semibold'>Pricing</h4>
              <div className='grid gap-4 sm:grid-cols-3'>
                <div className='space-y-2'>
                  <Label htmlFor='pricePerNight'>Price per Night</Label>
                  <div className='relative'>
                    <DollarSign className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
                    <Input
                      {...register('pricePerNight', {
                        valueAsNumber: true,
                        min: { value: 0, message: 'Price must be greater than 0' },
                      })}
                      id='pricePerNight'
                      type='number'
                      className='pl-8'
                      placeholder='0.00'
                      min={0}
                      step={1}
                    />
                  </div>
                  {errors.pricePerNight && (
                    <p className='text-destructive text-sm'>{errors.pricePerNight.message}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='minimumStay'>Minimum Stay</Label>
                  <div className='relative'>
                    <Clock className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
                    <Input
                      {...register('minimumStay', {
                        valueAsNumber: true,
                        min: { value: 1, message: 'Minimum stay must be at least 1 night' },
                      })}
                      id='minimumStay'
                      type='number'
                      className='pl-8'
                      placeholder='1'
                      min={1}
                      step={1}
                    />
                  </div>
                  {errors.minimumStay && (
                    <p className='text-destructive text-sm'>{errors.minimumStay.message}</p>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='maximumGuests'>Maximum Guests</Label>
                  <div className='relative'>
                    <Users className='text-muted-foreground absolute left-2 top-2.5 h-4 w-4' />
                    <Input
                      {...register('maximumGuests', {
                        valueAsNumber: true,
                        min: { value: 1, message: 'Maximum guests must be at least 1' },
                      })}
                      id='maximumGuests'
                      type='number'
                      className='pl-8'
                      placeholder='1'
                      min={1}
                      step={1}
                    />
                  </div>
                  {errors.maximumGuests && (
                    <p className='text-destructive text-sm'>{errors.maximumGuests.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rules Section */}
          <div className='space-y-4'>
            <div className='flex items-center gap-4'>
              {sections.rules.icon}
              <div>
                <h2 className='text-lg font-semibold'>{sections.rules.title}</h2>
                <p className='text-muted-foreground text-sm'>{sections.rules.description}</p>
              </div>
            </div>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='houseRules'>House Rules</Label>
                <p className='text-muted-foreground text-sm'>
                  Clearly outline what is and isn't allowed at your property. Consider including
                  rules about: smoking, pets, parties, quiet hours, additional guests, etc.
                </p>
                <Textarea
                  {...register('houseRules')}
                  id='houseRules'
                  placeholder='Enter house rules'
                  className='min-h-[150px]'
                />
                {errors.houseRules && (
                  <p className='text-destructive text-sm'>{errors.houseRules.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Visibility Section */}
          <div
            className={cn(
              'space-y-4 rounded-lg bg-zinc-50 p-4',
              getValues('published')?.valueOf() && 'bg-success/15 dark:bg-success/40',
            )}
          >
            <div className='flex items-center gap-4'>
              {sections.visibility.icon}
              <div>
                <h2 className='text-lg font-semibold'>{sections.visibility.title}</h2>
                <p className='text-muted-foreground text-sm'>{sections.visibility.description}</p>
              </div>
            </div>

            <div className='space-y-6'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='published'>Listing Visibility</Label>
                    <p className='text-muted-foreground text-sm'>
                      When unpublished, your listing won't be visible or bookable by guests
                    </p>
                  </div>
                  <Controller
                    name='published'
                    control={control}
                    render={({ field }) => (
                      <Switch
                        checked={field.value || false}
                        onCheckedChange={field.onChange}
                        id='published'
                      />
                    )}
                  />
                </div>
                {errors.published && (
                  <p className='text-destructive text-sm'>{errors.published.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className='sticky bottom-0 flex items-center justify-between border-t p-4'>
          <Button
            disabled={isSubmitting || !formState.isValid || !formState.isDirty}
            type='submit'
            className='flex items-center gap-2'
          >
            {status === 'executing' ? (
              <>
                <Loader2 className='animate-spin' />
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
            <DisappearingComponent disappearIn={3} className='text-green-600'>
              Your changes have been saved
            </DisappearingComponent>
          )}
        </div>
      </form>
    </SpectrumProvider>
  );
}
