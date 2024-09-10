import { CalendarDate, createCalendar } from '@internationalized/date';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import {
  AriaRangeCalendarProps,
  DateValue,
  useLocale,
  useRangeCalendar,
} from 'react-aria';
import { useRangeCalendarState } from 'react-stately';

import { RangeValue } from '@/utils/types';

import { CalendarButton } from './Button';
import { CalendarGrid } from './CalendarGrid';

interface CalendarProps extends AriaRangeCalendarProps<DateValue> {
  getCellContent?: (date: DateValue) => React.ReactNode;
  onChange?: (date: RangeValue<DateValue> | null) => void;
}

export function Calendar({
  getCellContent,
  onChange,
  ...props
}: CalendarProps) {
  const { locale } = useLocale();
  const state = useRangeCalendarState({
    ...props,
    locale,
    createCalendar,
    onChange,
    defaultValue: {
      start: new CalendarDate(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
      ),
      end: new CalendarDate(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate(),
      ),
    },
  });

  const ref = useRef<HTMLDivElement>(null);
  const { calendarProps, prevButtonProps, nextButtonProps, title } =
    useRangeCalendar(props, state, ref);

  return (
    <div {...calendarProps} className='w-full'>
      <div className='flex items-center pb-4'>
        <h2 className='flex-1 font-bold text-5xl ml-2'>{title}</h2>
        <CalendarButton {...prevButtonProps}>
          <ChevronLeft size={36} />
        </CalendarButton>
        <CalendarButton {...nextButtonProps}>
          <ChevronRight size={36} />
        </CalendarButton>
      </div>
      <CalendarGrid state={state} getCellContent={getCellContent} />
    </div>
  );
}
