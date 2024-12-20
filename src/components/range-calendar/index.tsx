'use client';
import { createCalendar, getLocalTimeZone, today as getToday } from '@internationalized/date';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';
import { AriaRangeCalendarProps, DateValue, useLocale, useRangeCalendar } from 'react-aria';
import { useRangeCalendarState } from 'react-stately';

import { RangeValue } from '@/utils/types';

import { CalendarButton } from './Button';
import { CalendarGrid } from './CalendarGrid';

interface CalendarProps extends AriaRangeCalendarProps<DateValue> {
  getCellContent?: (date: DateValue) => React.ReactNode;
  getHeaderContent?: (title: string) => React.ReactNode;
  onChange?: (date: RangeValue<DateValue> | null) => void;
  border?: boolean;
}

export function Calendar({
  getCellContent,
  getHeaderContent,
  onChange,
  border = true,
  ...props
}: CalendarProps) {
  const { locale } = useLocale();
  const today = getToday(getLocalTimeZone());
  const state = useRangeCalendarState({
    ...props,
    locale,
    createCalendar,
    onChange,
    minValue: today,
    isDateUnavailable: props.isDateUnavailable,
    defaultValue: {
      start: today.add({ days: 1 }),
      end: today.add({ days: 2 }),
    },
  });

  const ref = useRef<HTMLDivElement>(null);
  const { calendarProps, prevButtonProps, nextButtonProps, title } = useRangeCalendar(
    props,
    state,
    ref,
  );

  return (
    <div {...calendarProps} className='w-full'>
      <div className='flex items-center pb-4'>
        {getHeaderContent ? (
          getHeaderContent(title)
        ) : (
          <h2 className='flex-1 text-xl ml-2 text-muted-foreground'>{title}</h2>
        )}
        <CalendarButton {...prevButtonProps}>
          <ChevronLeft size={36} />
        </CalendarButton>
        <CalendarButton {...nextButtonProps}>
          <ChevronRight size={36} />
        </CalendarButton>
      </div>
      <CalendarGrid state={state} getCellContent={getCellContent} border={border} />
    </div>
  );
}
