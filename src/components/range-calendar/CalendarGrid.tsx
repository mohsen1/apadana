import { CalendarDate, getWeeksInMonth } from '@internationalized/date';
import { AriaCalendarGridProps, useCalendarGrid, useLocale } from 'react-aria';
import { RangeCalendarState } from 'react-stately';

import { CalendarCell } from './CalendarCell';

interface CalendarGridProps extends AriaCalendarGridProps {
  state: RangeCalendarState;
  getCellContent?: (date: CalendarDate) => React.ReactNode;
  border?: boolean;
}

export function CalendarGrid({
  state,
  getCellContent,
  border = true,
  ...props
}: CalendarGridProps) {
  const { locale } = useLocale();
  const { gridProps, headerProps, weekDays } = useCalendarGrid(props, state);

  // Get the number of weeks in the month so we can render the proper number of rows.
  const weeksInMonth = getWeeksInMonth(state.visibleRange.start, locale);

  return (
    <table {...gridProps} cellPadding='0' className='flex-1 w-full'>
      <thead {...headerProps} className='/80'>
        <tr className='grid grid-cols-7 w-full text-muted-foreground'>
          {weekDays.map((day, index) => (
            <th key={index}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: weeksInMonth }, (_, weekIndex) => (
          <tr key={weekIndex} className='grid grid-cols-7 w-full'>
            {state
              .getDatesInWeek(weekIndex)
              .map((date, i) =>
                date ? (
                  <CalendarCell
                    key={i}
                    state={state}
                    date={date}
                    border={border}
                    getCellContent={getCellContent}
                  />
                ) : (
                  <td key={i} />
                ),
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
