'use client';

import { CalendarDate, DateValue, getLocalTimeZone, isSameDay } from '@internationalized/date';
import { Listing, ListingInventory } from '@prisma/client';

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
        border={false}
        value={value}
        onChange={onChange}
        getHeaderContent={(title) => (
          <h2 className='flex-1 text-xl font-bold lg:text-2xl'>{title}</h2>
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
          return <CalendarTileContent inventory={inventory} listing={listing} />;
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
  const unAvailableDash = <div className='border-foreground/10 mt-4 h-0 w-6 border-2 border-b' />;
  const price = formatCurrency(inventory.price, listing.currency);
  const content = !inventory.isAvailable ? unAvailableDash : price;
  return <div className={cn('/80 py-2 text-center text-sm')}>{content}</div>;
}
