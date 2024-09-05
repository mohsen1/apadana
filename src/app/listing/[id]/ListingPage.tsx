import { Listing, UploadThingImage, User } from '@prisma/client';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Amenity } from '@/app/listing/[id]/Amenity';
import { DatePicker } from '@/app/listing/[id]/DatePicker';
import { LightBox } from '@/app/listing/[id]/LightBox';

export function ListingPage({
  listingData,
}: {
  listingData: Listing & { images: UploadThingImage[]; owner: User };
}) {
  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900'>
      {/* Cover Photo */}
      <LightBox images={listingData.images} index={0}>
        <div className='relative h-[50vh] w-full '>
          <Image
            src={listingData.images[0].url}
            alt={listingData.title}
            layout='fill'
            objectFit='cover'
            priority
          />
        </div>
      </LightBox>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Listing Details */}
          <div className='md:col-span-2'>
            <h1 className='text-3xl font-bold mb-2 dark:text-white'>
              {listingData.title}
            </h1>
            <p className='text-gray-600 dark:text-gray-300 mb-4'>
              {listingData.address}
            </p>
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              About this place
            </h2>
            <p className='text-gray-700 dark:text-gray-300 mb-6'>
              {listingData.description}
            </p>

            {/* Amenities */}
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              Amenities
            </h2>
            <ul className='grid grid-cols-2 gap-2 mb-6'>
              {listingData.amenities.map((amenity) => (
                <li
                  key={amenity}
                  className='flex items-center dark:text-gray-300'
                >
                  <Amenity name={amenity} />
                </li>
              ))}
            </ul>

            {/* Image Gallery */}
            <h2 className='text-2xl font-semibold mb-4 dark:text-white'>
              Photo Gallery
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {listingData.images.slice(1).map((image, index) => (
                <LightBox
                  key={index}
                  images={listingData.images}
                  index={index + 1}
                >
                  <div key={index} className='relative h-48'>
                    <Image
                      src={image.url}
                      key={image.id}
                      alt={`${listingData.title} - Image ${index + 2}`}
                      layout='fill'
                      objectFit='cover'
                    />
                  </div>
                </LightBox>
              ))}
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <Card className='dark:bg-gray-800 dark:text-white'>
              <CardHeader>
                <CardTitle className='text-2xl font-bold'>
                  ${listingData.pricePerNight}{' '}
                  <span className='text-base font-normal'>/ night</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DatePicker />
                <Button className='w-full mt-4'>Reserve</Button>
              </CardContent>
            </Card>

            {/* Host Information */}
            <Card className='mt-6 dark:bg-gray-800 dark:text-white'>
              <CardHeader>
                <CardTitle className='text-xl font-semibold'>
                  Hosted by {listingData.owner.firstName}
                </CardTitle>
              </CardHeader>
              <CardContent className='flex items-center'>
                <Image
                  src={listingData.owner.imageUrl ?? ''}
                  alt={listingData.owner.firstName ?? ''}
                  width={64}
                  height={64}
                  className='rounded-full mr-4'
                />
                <Button
                  variant='outline'
                  className='dark:text-gray-300 dark:border-gray-600'
                >
                  Contact Host
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
