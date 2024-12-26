'use client';

import { getLocalTimeZone, today as getToday } from '@internationalized/date';
import { ListingInventory } from '@prisma/client';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { DateValue } from 'react-aria';

import { FullListing } from '@/lib/types';
import {
  formatTimezone,
  getLocale,
  isCurrentlyAnotherDayInTimeZone,
  isDateInRange,
} from '@/lib/utils';

import { AvailabilityManagementCalendar } from '@/components/calendar/AvailabilityManagementCalendar';
import { Banner } from '@/components/common/Banner';
import { Card, CardContent } from '@/components/ui/card';

import { editInventory } from '@/app/listing/[id]/manage/action';
import PriceEditor from '@/app/listing/[id]/manage/calendar/PriceEditor';
import { RangeValue } from '@/utils/types';

export function HostCalendar({ listingData }: { listingData: FullListing }) {
  const [listingInventory, setListingInventory] = useState<ListingInventory[]>(
    listingData.inventory,
  );
  const today = getToday(listingData.timeZone);
  const [range, setRange] = useState<RangeValue<DateValue> | null>({
    start: today,
    end: today,
  });
  const [rangePrice, setRangePrice] = useState<number>(listingData.pricePerNight);
  const [rangeAvailable, setRangeAvailable] = useState<boolean>(isRangeAvailable(range));
  const { execute: executeEditInventory, status: editInventoryStatus } = useAction(editInventory, {
    onSuccess: (result) => {
      if (result.data?.listing) {
        setListingInventory(result.data.listing.inventory);
      }
    },
    onError: (error) => {
      throw error;
    },
  });

  /**
   * Check if the range is available. It checks the availability of all dates in the range.
   * @param range - The range to check.
   * @returns True if the range is available, false otherwise.
   */
  function isRangeAvailable(range: RangeValue<DateValue> | null) {
    const start = range?.start?.toDate(listingData.timeZone);
    const end = range?.end?.toDate(listingData.timeZone);
    if (!start || !end) {
      return false;
    }
    const inventoryInRange = listingInventory.filter((inventory) => {
      return isDateInRange(inventory.date, { start, end });
    });
    if (inventoryInRange.length === 0) {
      return false;
    }
    return inventoryInRange.every((inventory) => {
      return inventory.isAvailable;
    });
  }

  /**
   * Get the price for the range.
   * @param range - The range to get the price for.
   * @returns The price for the range.
   */
  function getRangePrice(range: RangeValue<DateValue> | null) {
    const start = range?.start?.toDate(listingData.timeZone);
    const end = range?.end?.toDate(listingData.timeZone);
    if (!start || !end) {
      return 0;
    }
    const inventoryInRange = listingInventory.filter((inventory) => {
      return isDateInRange(inventory.date, { start, end });
    });
    if (inventoryInRange.length === 0) {
      return listingData.pricePerNight;
    }
    const isAllPricesSame = inventoryInRange.every((inventory) => {
      return inventory.price === inventoryInRange[0].price;
    });
    if (isAllPricesSame) {
      return inventoryInRange[0].price;
    }
    return listingData.pricePerNight;
  }

  /**
   * Submit the range.
   * @param range - The range to submit.
   */
  async function onSubmit(range: RangeValue<DateValue>) {
    if (!range || !range.start || !range.end) {
      return;
    }

    const rangeLength = range.end.compare(range.start) + 1;

    const inventory = Array.from({ length: rangeLength }, (_, index) => {
      const date = range.start.add({ days: index });
      return {
        date: date.toDate(listingData.timeZone),
        price: rangePrice,
        isAvailable: rangeAvailable,
      };
    });

    executeEditInventory({
      listingId: listingData.id,
      inventory,
    });
  }

  return (
    <Card className='box-shadow-none bg-background mt-6 border-none'>
      <Banner
        title='Welcome to your new listing!'
        description='You can now start adding your listing details and setting up your availability and pricing.'
        queryParam='newListing'
      />
      <CardContent className='px-2'>
        <div className='grid gap-8 lg:grid-cols-[1fr_max-content]'>
          <div className=''>
            <AvailabilityManagementCalendar
              value={range}
              listing={{
                ...listingData,
                inventory: listingInventory,
              }}
              onChange={(range) => {
                setRange(range);
                setRangeAvailable(isRangeAvailable(range));
                setRangePrice(getRangePrice(range));
              }}
            />
            <TimeZoneWarning listingTimeZone={listingData.timeZone} />
          </div>
          <div className='min-w-[300px] space-y-4'>
            {range && (
              <PriceEditor
                range={{
                  start: range.start.toDate(listingData.timeZone),
                  end: range.end?.toDate(listingData.timeZone),
                }}
                listingData={listingData}
                rangePrice={rangePrice}
                setRangePrice={setRangePrice}
                rangeAvailable={rangeAvailable}
                setRangeAvailable={setRangeAvailable}
                editInventoryStatus={editInventoryStatus}
                onSubmit={() => onSubmit(range)}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
/**
 * Warning that the calendar is in a different time zone than the local time zone.
 */
function TimeZoneWarning({ listingTimeZone }: { listingTimeZone: string }) {
  if (listingTimeZone === getLocalTimeZone()) {
    return null;
  }
  return (
    <div className='mt-2 text-sm'>
      Note: This calendar is in{' '}
      <span className='font-semibold'>{formatTimezone(listingTimeZone)}</span> time zone.
      {/* if it's a different day in listing time zone than local time, the dates will be different */}
      {isCurrentlyAnotherDayInTimeZone(new Date(), listingTimeZone)
        ? `The current date is ${new Date().toLocaleDateString(getLocale(), {
            month: 'long',
            day: 'numeric',
          })} in the listing time zone.`
        : ''}
    </div>
  );
}
