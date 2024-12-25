import { CalendarDate, getLocalTimeZone, isSameDay, today } from '@internationalized/date';
import { useRef } from 'react';
import { AriaCalendarCellProps, mergeProps, useCalendarCell, useFocusRing } from 'react-aria';
import { RangeCalendarState } from 'react-stately';

import { cn } from '@/lib/utils';

interface CalendarCellProps extends AriaCalendarCellProps {
  state: RangeCalendarState;
  date: CalendarDate;
  getCellContent?: (date: CalendarDate) => React.ReactNode;
  border?: boolean;
}

export function CalendarCell({ state, date, getCellContent, border = true }: CalendarCellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const {
    cellProps,
    buttonProps,
    isSelected,
    isOutsideVisibleRange,
    isDisabled,
    formattedDate,
    isUnavailable,
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
    isSelected && isSelectionStart && !isOnlyOneDaySelected && !isFirstDayOfWeek;
  const isRoundedRight = isSelected && isSelectionEnd && !isOnlyOneDaySelected && !isLastDayOfWeek;
  const isToday = date.compare(today(getLocalTimeZone())) === 0;

  const { focusProps, isFocusVisible } = useFocusRing();

  return (
    <td {...cellProps} className={`relative ${isFocusVisible ? 'z-10' : 'z-0'}`}>
      <div
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        hidden={isOutsideVisibleRange}
        className={cn('group grid h-full w-full place-items-center outline-none', 'py-[0.75rem]', {
          'hover:bg-accent/20': !isUnavailable,
          'border-primary-600 border': border,
          'rounded-l-xlg': isRoundedLeft,
          'rounded-r-xlg': isRoundedRight,
          'rounded-xlg': isOnlyOneDaySelected,
          'bg-accent': isSelected,
          'hover:rounded-xlg': !state.focusedDate,
          'outline-accent outline outline-2 outline-offset-2': isFocusVisible,
          'cursor-not-allowed opacity-50': isDisabled && !isSelected,
          'after: after:content-[""]': isUnavailable,
        })}
      >
        <div className={cn('flex flex-col items-center justify-center', {})}>
          <div
            className={cn(
              'text[1rem] /80 flex h-[2rem] w-[2rem] items-center justify-center p-2 text-center',
              {
                'bg-border/90 text-foreground rounded-xlg': isToday,
                // Some crazy CSS magic to have a cross line over the cell date
                [`after:absolute after:inset-0 after:scale-[0.4] after:bg-[linear-gradient(to_top_left,transparent_calc(50%-2px),gray_calc(50%-2px),gray_calc(50%+2px),transparent_calc(50%+2px))] after:from-transparent after:to-transparent after:bg-[length:100%_100%] after:bg-no-repeat`]:
                  isUnavailable,
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
