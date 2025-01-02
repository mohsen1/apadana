import { Time } from '@internationalized/date';

export type TimeString = `${number}:${number}`;

/**
 * Converts a time string in HH:MM format to a Time object
 * @param timeString - Time string in HH:MM format
 * @returns Time object or undefined if invalid input
 */
export const stringToTime = (timeString: TimeString | undefined): Time | undefined => {
  if (!timeString) return undefined;

  const [hour, minute] = timeString.split(':').map((n) => Number.parseInt(n, 10));
  if (isNaN(hour) || isNaN(minute)) return undefined;

  return new Time(hour || 0, minute || 0);
};

/**
 * Compares two time strings in HH:MM format
 * @returns negative if time1 < time2, positive if time1 > time2, 0 if equal or invalid
 */
export const compareTimeStrings = (
  time1: TimeString | undefined,
  time2: TimeString | undefined,
): number => {
  const t1 = stringToTime(time1);
  const t2 = stringToTime(time2);

  if (!t1 || !t2) return 0;
  return t1.compare(t2);
};
