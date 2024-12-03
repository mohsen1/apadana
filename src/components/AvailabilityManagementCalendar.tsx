'use client';

import {
  CalendarDate,
  DateValue,
  getLocalTimeZone,
  isSameDay,
} from '@internationalized/date';

import { cn, formatCurrency } from '@/lib/utils';

import { Listing, ListingInventory } from '@/__generated__/prisma';
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
        border={false}
        value={value}
        onChange={onChange}
        getHeaderContent={(title) => (
          <h2 className='font-bold text-5xl flex-1'>{title}</h2>
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
  const unAvailableDash = (
    <div className='border-2 border-b  border-foreground/10 w-6 h-0' />
  );
  const price = formatCurrency(inventory.price, listing.currency);
  const content = !inventory.isAvailable ? unAvailableDash : price;
  return (
    <div className={cn('text-sm text-foreground/80 text-center py-2')}>
      {content}
    </div>
  );
}
