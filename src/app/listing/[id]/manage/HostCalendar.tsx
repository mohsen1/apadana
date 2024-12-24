'use client';

import { getLocalTimeZone, today as getToday } from '@internationalized/date';
import { ListingInventory } from '@prisma/client';
import { RefreshCcw } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
import { DateValue } from 'react-aria';

import { FullListing } from '@/lib/types';
import {
  formatCurrencySymbol,
  formatHHMMDate,
  formatTimezone,
  getLocale,
  isCurrentlyAnotherDayInTimeZone,
  isDateInRange,
} from '@/lib/utils';

import { AvailabilityManagementCalendar } from '@/components/AvailabilityManagementCalendar';
import { LabledInput } from '@/components/range-calendar/LabledInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { editInventory } from '@/app/listing/[id]/manage/action';
import { getListing } from '@/app/listing/action';
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
      if (result.data) {
        return refreshInventory();
      }
    },
    onError: (error) => {
      throw error;
    },
  });

  /**
   * Refresh the inventory.
   * We do this after updating the inventory to get the latest data.
   */
  async function refreshInventory() {
    const res = await getListing({ id: listingData.id });
    if (res?.data?.listing) {
      setListingInventory(res.data.listing.inventory);
    }
  }

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
    <Card className='box-shadow-none mt-6 border-none'>
      <CardContent>
        <div className='grid gap-8 lg:grid-cols-[1fr_auto]'>
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
              <>
                <div className='space-y-2'>
                  <Label htmlFor='datePrice' className='text-lg'>
                    Set the price for{' '}
                    <div>
                      <span className='font-bold' suppressHydrationWarning>
                        {range?.start
                          ?.toDate(listingData.timeZone)
                          .toLocaleDateString(getLocale(), {
                            month: 'long',
                            day: 'numeric',
                          })}
                      </span>
                      {range?.end && range?.end.compare(range.start) > 0 ? (
                        <>
                          {' to '}
                          <span className='font-bold'>
                            {range?.end
                              ?.toDate(listingData.timeZone)
                              .toLocaleDateString(getLocale(), {
                                month: 'long',
                                day: 'numeric',
                              })}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </Label>
                  <div className='relative pt-4'>
                    <LabledInput
                      label={
                        <span className='text-right text-2xl'>
                          {formatCurrencySymbol(listingData.currency)}
                        </span>
                      }
                      disabled={editInventoryStatus === 'executing' || !rangeAvailable}
                      id='datePrice'
                      inputMode='decimal'
                      pattern='^\d*\.?\d*$'
                      type='text'
                      step='1'
                      min='1'
                      className='l-8 py-6 text-2xl'
                      placeholder='100.00'
                      value={rangePrice}
                      onChange={(e) => {
                        setRangePrice(parseFloat(e.target.value));
                      }}
                    />
                  </div>
                </div>
                <div className='ml-12 flex items-center space-x-2 pt-2'>
                  <Switch
                    id='dateAvailable'
                    disabled={editInventoryStatus === 'executing'}
                    checked={rangeAvailable}
                    className='scale-150'
                    onCheckedChange={(checked) => {
                      setRangeAvailable(checked);
                    }}
                  />
                  <Label className='pl-2 text-lg' htmlFor='dateAvailable'>
                    {rangeAvailable ? 'Available' : 'Unavailable'}
                  </Label>
                </div>
                <div className='flex items-end justify-end space-x-2 py-8'>
                  <Button
                    disabled={editInventoryStatus === 'executing'}
                    className='flex items-center gap-2 space-x-2'
                    onClick={async (e) => {
                      e.preventDefault();

                      if (!range) {
                        return;
                      }
                      return onSubmit(range);
                    }}
                  >
                    <RefreshCcw
                      className={editInventoryStatus === 'executing' ? 'animate-spin' : ''}
                    />
                    {range.start.compare(range.end) === 0 ? 'Update Date' : 'Update Dates'}
                  </Button>
                </div>
              </>
            )}
            <div className='text-muted-foreground mt-2 text-sm'>
              <p>Check-in: {formatHHMMDate(listingData.checkInTime)}</p>
              <p>Check-out: {formatHHMMDate(listingData.checkOutTime)}</p>
            </div>
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
