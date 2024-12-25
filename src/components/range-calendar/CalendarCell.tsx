import { CalendarDate, getLocalTimeZone, isSameDay, today } from '@internationalized/date';
import { useRef } from 'react';
import { AriaCalendarCellProps, mergeProps, useCalendarCell, useFocusRing } from 'react-aria';
import { RangeCalendarState } from 'react-stately';

import { cn } from '@/lib/utils';

import { CircleAround } from '@/components/range-calendar/CircleAround';

/**
 * CalendarCellProps:
 * - Extends React Aria's AriaCalendarCellProps
 * - Accepts a RangeCalendarState object for date and range management
 * - Allows a function getCellContent() to inject additional content inside each cell
 * - border?: toggles whether the cell has a border
 */
interface CalendarCellProps extends AriaCalendarCellProps {
  state: RangeCalendarState; // State of the RangeCalendar (date selection, range, etc.)
  date: CalendarDate; // The date to be rendered in the cell
  getCellContent?: (date: CalendarDate) => React.ReactNode; // Optional custom content function
  border?: boolean; // Optional toggle for cell border
}

/**
 * CalendarCell component:
 * Renders a single cell in the calendar grid. Handles selection, focus, and styling.
 * Adds special rounded corners if it's the last day of the selection OR the last day of the month.
 */
export function CalendarCell({ state, date, getCellContent, border = true }: CalendarCellProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Visual focus
  const { focusProps, isFocusVisible } = useFocusRing();

  // Calendar cell logic
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate,
    isUnavailable,
  } = useCalendarCell({ date }, state, ref);

  // Identify if it's today
  const isToday = date.compare(today(getLocalTimeZone())) === 0;
  // Determine the total days in the month
  const daysInMonth = date.calendar.getDaysInMonth(date);
  // Flag for first/last day of the month
  const isFirstDayOfMonth = date.day === 1;
  const isLastDayOfMonth = date.day === daysInMonth;

  // Check if this date is the start or end of the highlighted selection
  const startOfSelection = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.start)
    : isSelected;
  const endOfSelection = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.end)
    : isSelected;

  // One-day selection
  const oneDayOnly = startOfSelection && endOfSelection;

  // Build classes for the container
  // If it's the last day of the selection or the last day of the month, we give it some extra rounding.
  const classes = cn('group grid h-full w-full place-items-center outline-none py-[0.75rem]', {
    'hover:bg-accent': !isUnavailable,
    'border-primary-600 border': border,
    'bg-accent/70': isSelected,
    'rounded-xlg': oneDayOnly,
    // Round corners when it's the start or end of the selection, or if it's physically the last day of the month.
    'rounded-l-xlg':
      (startOfSelection && !oneDayOnly && !isFirstDayOfMonth) || (isSelected && isFirstDayOfMonth),
    'rounded-r-xlg':
      (endOfSelection && !oneDayOnly && !isLastDayOfMonth) || (isSelected && isLastDayOfMonth),
    'hover:rounded-xlg': !state.focusedDate || !isSelected,
    'outline-accent outline outline-2 outline-offset-2': isFocusVisible,
    'cursor-not-allowed opacity-50': isDisabled && !isSelected,
    'after:content-[""]': isUnavailable,
  });

  // Classes for the date number
  const dateNumberClasses = cn(
    'text-[1rem]/80 flex h-[2rem] w-[2rem] items-center justify-center text-center',
    {
      // 'text-foreground rounded-full bg-transparent border border-2 border-border/90': isToday,
      'after:absolute after:inset-0 after:scale-[0.4] after:bg-[linear-gradient(to_top_left,transparent_calc(50%-2px),gray_calc(50%-2px),gray_calc(50%+2px),transparent_calc(50%+2px))] after:bg-no-repeat':
        isUnavailable,
    },
  );

  const dateNumber = isToday ? (
    <CircleAround className='pointer-events-none' color='#e60000'>
      <span className='text-foreground'>{formattedDate}</span>
    </CircleAround>
  ) : (
    formattedDate
  );

  return (
    <td {...cellProps} className={cn('relative', isFocusVisible ? 'z-10' : 'z-0')}>
      <div
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={classes}
      >
        <div className='flex flex-col items-center justify-center'>
          <div className={dateNumberClasses}>{dateNumber}</div>
          {getCellContent?.(date)}
        </div>
      </div>
    </td>
  );
}
