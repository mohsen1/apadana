'use client';

import { Listing, ListingInventory } from '@prisma/client';
import { ChevronLeft, ChevronRight, XIcon } from 'lucide-react';
import Calendar from 'react-calendar';

import { areEqualDates, cn } from '@/lib/utils';

export function AvailabilityManagementCalendar({
  value,
  listing,
  onDateChange,
}: {
  value: Date;
  listing: Listing & {
    inventory: ListingInventory[];
  };
  onDateChange: (date: Date) => void;
}) {
  return (
    <div className='w-full'>
      <Calendar
        showFixedNumberOfWeeks
        tileContent={({ date }) => {
          let inventory = listing.inventory.find((inventory) =>
            areEqualDates(inventory.date, date),
          );
          if (!inventory) {
            inventory = {
              price: listing.pricePerNight,
              isBooked: true,
              id: 0,
              listingId: listing.id,
              date: date,
              bookingId: null,
            };
          }
          return <CalendarTileContent inventory={inventory} />;
        }}
        nextLabel={<ChevronRight />}
        prevLabel={<ChevronLeft />}
        next2Label={null}
        prev2Label={null}
        view='month'
        value={value}
        onClickDay={(value) => {
          onDateChange(value);
        }}
      />
    </div>
  );
}

function CalendarTileContent({ inventory }: { inventory: ListingInventory }) {
  const content = inventory.isBooked ? (
    <XIcon className='inline text-foreground/50' />
  ) : (
    `$${inventory.price}`
  );
  return (
    <div className={cn('text-sm text-foreground/80 text-center')}>
      {content}
    </div>
  );
}
