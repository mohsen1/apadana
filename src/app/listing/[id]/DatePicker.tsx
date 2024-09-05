'use client';

import { RangeCalendar } from '@adobe/react-spectrum';
import { parseDate } from '@internationalized/date';

import { SpectrumProvider } from '@/components/SpectrumProvider';

export function DatePicker() {
  return (
    <SpectrumProvider>
      <div className='grid place-items-center'>
        <RangeCalendar
          aria-label='Start'
          defaultValue={{
            start: parseDate('2024-01-01'),
            end: parseDate('2024-01-02'),
          }}
        />
      </div>
    </SpectrumProvider>
  );
}
