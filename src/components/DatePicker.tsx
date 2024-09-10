'use client';

import { RangeCalendar } from '@adobe/react-spectrum';
import { CalendarDate, getLocalTimeZone, today } from '@internationalized/date';

import { SpectrumProvider } from '@/components/SpectrumProvider';

import { RangeValue } from '@/utils/types';

export function DatePicker({
  selected,
  onSelect,
}: {
  selected: RangeValue<CalendarDate>;
  onSelect: (value: RangeValue<CalendarDate> | null) => void;
}) {
  return (
    <SpectrumProvider>
      <div className='grid place-items-center'>
        <RangeCalendar
          minValue={today(getLocalTimeZone())}
          aria-label='Start and end date'
          onChange={onSelect}
          defaultValue={selected}
        />
      </div>
    </SpectrumProvider>
  );
}
