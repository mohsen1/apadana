import { CalendarDate, getDayOfWeek, isSameDay } from '@internationalized/date';
import { useRef } from 'react';
import {
  AriaCalendarCellProps,
  mergeProps,
  useCalendarCell,
  useFocusRing,
  useLocale,
} from 'react-aria';
import { RangeCalendarState } from 'react-stately';

import { cn } from '@/lib/utils';

interface CalendarCellProps extends AriaCalendarCellProps {
  state: RangeCalendarState;
  date: CalendarDate;
  getCellContent?: (date: CalendarDate) => React.ReactNode;
}

export function CalendarCell({
  state,
  date,
  getCellContent,
}: CalendarCellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate,
    isInvalid,
  } = useCalendarCell({ date }, state, ref);

  // The start and end date of the selected range will have
  // an emphasized appearance.

  const isSelectionStart = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.start)
    : isSelected;

  const isSelectionEnd = state.highlightedRange
    ? isSameDay(date, state.highlightedRange.end)
    : isSelected;

  // We add rounded corners on the left for the first day of the month,
  // the first day of each week, and the start date of the selection.
  // We add rounded corners on the right for the last day of the month,
  // the last day of each week, and the end date of the selection.
  const { locale } = useLocale();
  const dayOfWeek = getDayOfWeek(date, locale);
  const isRoundedLeft =
    isSelected && (isSelectionStart || dayOfWeek === 0 || date.day === 1);
  const isRoundedRight =
    isSelected &&
    (isSelectionEnd ||
      dayOfWeek === 6 ||
      date.day === date.calendar.getDaysInMonth(date));

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
          'w-full h-full min-h-24 outline-none group grid place-items-center border border-primary-600',
          {
            'rounded-l-full': isRoundedLeft,
            'rounded-r-full': isRoundedRight,
            'bg-foreground/50': isSelected,
            'bg-destructive-300': isSelected && isInvalid,
            'bg-primary-100': isSelected && !isInvalid,
            'bg-accent/10': isSelected,
            disabled: isDisabled,
          },
        )}
      >
        <div
          className={cn({
            'text-foreground': !isDisabled && !isInvalid && !isSelected,
            'text-primary-600':
              isSelected && (isSelectionStart || isSelectionEnd),
            'text-error-600': isInvalid,
          })}
        >
          <div className='text-center'>{formattedDate}</div>
          {getCellContent?.(date)}
        </div>
      </div>
    </td>
  );
}
