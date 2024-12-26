'use client';

import { RefreshCcw } from 'lucide-react';
import { HookActionStatus } from 'next-safe-action/hooks';

import { FullListing } from '@/lib/types';
import { formatCurrencySymbol, formatHHMMDate } from '@/lib/utils';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function PriceEditor({
  range,
  listingData,
  rangePrice,
  setRangePrice,
  rangeAvailable,
  setRangeAvailable,
  editInventoryStatus,
  onSubmit,
}: {
  range: { start: Date; end?: Date };
  listingData: FullListing;
  rangePrice: number;
  setRangePrice: (price: number) => void;
  rangeAvailable: boolean;
  setRangeAvailable: (available: boolean) => void;
  editInventoryStatus: HookActionStatus;
  onSubmit: (range: { start: Date; end?: Date }) => void;
}) {
  return (
    <Card className='mx-auto w-full max-w-md'>
      <CardContent className='space-y-6 p-6'>
        {range && (
          <>
            <div className='space-y-4'>
              <div>
                <h2 className='text-2xl font-semibold'>
                  <div className='text-zinc-700'>Set the price for </div>
                  <span suppressHydrationWarning>
                    {range?.start?.toLocaleDateString(undefined, {
                      month: 'long',
                      day: 'numeric',
                    })}
                    {range?.end && range?.end.getTime() > range.start.getTime() && (
                      <>
                        <span className='text-zinc-700'>{' to '}</span>
                        <div>
                          {range?.end?.toLocaleDateString(undefined, {
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                      </>
                    )}
                  </span>
                </h2>
              </div>

              <div className='relative'>
                <div className='absolute left-3 top-1/2 -translate-y-1/2 text-2xl'>
                  {formatCurrencySymbol(listingData.currency)}
                </div>
                <Input
                  disabled={editInventoryStatus === 'executing' || !rangeAvailable}
                  id='datePrice'
                  inputMode='decimal'
                  pattern='^\d*\.?\d*$'
                  type='text'
                  min='1'
                  className='h-16 pl-8 text-2xl'
                  placeholder='100.00'
                  value={rangePrice}
                  onChange={(e) => setRangePrice(parseFloat(e.target.value))}
                />
              </div>

              <div className='flex items-center space-x-3'>
                <Switch
                  id='dateAvailable'
                  disabled={editInventoryStatus === 'executing'}
                  checked={rangeAvailable}
                  onCheckedChange={setRangeAvailable}
                />
                <Label htmlFor='dateAvailable' className='text-lg'>
                  {rangeAvailable ? 'Available' : 'Unavailable'}
                </Label>
              </div>
            </div>

            <Button
              disabled={editInventoryStatus === 'executing'}
              className='w-full'
              onClick={(e) => {
                e.preventDefault();
                if (!range) return;
                return onSubmit(range);
              }}
            >
              <RefreshCcw
                className={`mr-2 h-4 w-4 ${editInventoryStatus === 'executing' ? 'animate-spin' : ''}`}
              />
              {range.start.getTime() === range.end?.getTime() ? 'Update Date' : 'Update Dates'}
            </Button>
          </>
        )}

        <div className='mt-4 border-t pt-4'>
          <div className='text-muted-foreground space-y-1'>
            <p>Check-in: {formatHHMMDate(listingData.checkInTime)}</p>
            <p>Check-out: {formatHHMMDate(listingData.checkOutTime)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
