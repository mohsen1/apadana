import { Listing, UploadThingImage, User } from '@prisma/client';
import { Calendar } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ListingPage({
  listingData,
}: {
  listingData: Listing & { images: UploadThingImage[]; owner: User };
}) {
  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Cover Photo */}
      <div className='relative h-[50vh] w-full'>
        <Image
          src={listingData.images[0].url}
          alt={listingData.title}
          layout='fill'
          objectFit='cover'
          priority
        />
      </div>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {/* Listing Details */}
          <div className='md:col-span-2'>
            <h1 className='text-3xl font-bold mb-2'>{listingData.title}</h1>
            <p className='text-gray-600 mb-4'>{listingData.address}</p>
            <div className='flex items-center mb-4'>
              <span className='text-yellow-500 mr-1'>★</span>
              {/* <span>{listingData.rating}</span> */}
              <span className='mx-2'>·</span>
              {/* <span>{listingData.reviews} reviews</span> */}
            </div>
            <p className='text-gray-700 mb-6'>{listingData.description}</p>

            {/* Amenities */}
            <h2 className='text-2xl font-semibold mb-4'>Amenities</h2>
            <ul className='grid grid-cols-2 gap-2 mb-6'>
              {listingData.amenities.map((amenity) => (
                <li key={amenity} className='flex items-center'>
                  <span className='mr-2'>✓</span> {amenity}
                </li>
              ))}
            </ul>

            {/* Image Gallery */}
            <h2 className='text-2xl font-semibold mb-4'>Photo Gallery</h2>
            <div className='grid grid-cols-2 gap-4'>
              {listingData.images.slice(1).map((image, index) => (
                <div key={index} className='relative h-48'>
                  <Image
                    src={image.url}
                    key={image.id}
                    alt={`${listingData.title} - Image ${index + 2}`}
                    layout='fill'
                    objectFit='cover'
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Booking Card */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className='text-2xl font-bold'>
                  ${listingData.pricePerNight}{' '}
                  <span className='text-base font-normal'>/ night</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar mode='range' className='rounded-md border mb-4' />
                <Button className='w-full'>Reserve</Button>
              </CardContent>
            </Card>

            {/* Host Information */}
            <Card className='mt-6'>
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
                <Button variant='outline'>Contact Host</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
