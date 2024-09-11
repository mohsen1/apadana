'use client';

import {
  CalendarDate,
  DateValue,
  getLocalTimeZone,
  isSameDay,
} from '@internationalized/date';
import { Listing, ListingInventory } from '@prisma/client';
import { XIcon } from 'lucide-react';

import { cn, formatCurrency } from '@/lib/utils';

import { RangeValue } from '@/utils/types';

import { Calendar } from './range-calendar';

export function AvailabilityManagementCalendar({
  value,
  listing,
  onChange,
}: {
  value: RangeValue<DateValue> | null;
  listing: Listing & {
    inventory: ListingInventory[];
  };
  onChange: (value: RangeValue<DateValue> | null) => void;
}) {
  return (
    <div className='w-full text-2xl'>
      <Calendar
        value={value}
        onChange={onChange}
        getHeaderContent={(title) => (
          <h2 className='font-bold text-5xl flex-1 font-bold'>{title}</h2>
        )}
        getCellContent={(calendarDate) => {
          let inventory = listing.inventory.find((inventory) =>
            isSameDay(
              new CalendarDate(
                inventory.date.getFullYear(),
                inventory.date.getMonth() + 1,
                inventory.date.getDate(),
              ),
              calendarDate,
            ),
          );
          if (!inventory) {
            inventory = {
              price: listing.pricePerNight,
              isAvailable: false,
              id: 0,
              listingId: listing.id,
              bookingId: null,
              date: calendarDate.toDate(getLocalTimeZone()),
            };
          }
          return (
            <CalendarTileContent inventory={inventory} listing={listing} />
          );
        }}
      />
    </div>
  );
}

function CalendarTileContent({
  inventory,
  listing,
}: {
  inventory: ListingInventory;
  listing: Listing;
}) {
  const content = !inventory.isAvailable ? (
    <XIcon className='inline text-foreground/50' />
  ) : (
    formatCurrency(inventory.price, listing.currency)
  );
  return (
    <div className={cn('text-sm text-foreground/80 text-center')}>
      {content}
    </div>
  );
}
