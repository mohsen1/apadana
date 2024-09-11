import {
  CalendarDate,
  getLocalTimeZone,
  isSameDay,
  today,
} from '@internationalized/date';
import { useRef } from 'react';
import {
  AriaCalendarCellProps,
  mergeProps,
  useCalendarCell,
  useFocusRing,
} from 'react-aria';
import { RangeCalendarState } from 'react-stately';

import { cn } from '@/lib/utils';

interface CalendarCellProps extends AriaCalendarCellProps {
  state: RangeCalendarState;
  date: CalendarDate;
  getCellContent?: (date: CalendarDate) => React.ReactNode;
  border?: boolean;
}

export function CalendarCell({
  state,
  date,
  getCellContent,
  border = true,
}: CalendarCellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate,
  } = useCalendarCell({ date }, state, ref);

  const isLastDayOfWeek = date.day === date.calendar.getDaysInMonth(date);
  const isFirstDayOfWeek = date.day === 1;
  const isSelectionStart = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.start)
    : isSelected;
  const isSelectionEnd = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.end)
    : isSelected;
  const isOnlyOneDaySelected = isSelectionStart && isSelectionEnd;
  const isRoundedLeft =
    isSelected &&
    isSelectionStart &&
    !isOnlyOneDaySelected &&
    !isFirstDayOfWeek;
  const isRoundedRight =
    isSelected && isSelectionEnd && !isOnlyOneDaySelected && !isLastDayOfWeek;
  const isToday = date.compare(today(getLocalTimeZone())) === 0;

  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <td
      {...cellProps}
      className={`relative ${isFocusVisible ? 'z-10' : 'z-0'}`}
    >
      <div
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={cn(
          'w-full h-full outline-none group grid place-items-center',
          'transition-border-radius duration-300 ease-in-out',
          'hover:bg-accent/20',
          {
            'border border-primary-600': border,
            'rounded-l-full': isRoundedLeft,
            'rounded-r-full': isRoundedRight,
            'rounded-full': isOnlyOneDaySelected,
            'bg-accent/10': isSelected,
            'hover:rounded-full': !state.focusedDate,
            'outline outline-2 outline-offset-2 outline-accent': isFocusVisible,
            'opacity-50 cursor-not-allowed': isDisabled && !isSelected,
          },
        )}
      >
        <div className='flex flex-col items-center justify-center gap-2'>
          <div
            className={cn(
              'text-center w-[2rem] h-[2rem] text[1rem] p-2 flex items-center justify-center text-foreground/80',
              {
                'bg-ring/90 text-background rounded-full ': isToday,
              },
            )}
          >
            {formattedDate}
          </div>
          {getCellContent?.(date)}
        </div>
      </div>
    </td>
  );
}
