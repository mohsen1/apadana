import { Currency } from '@prisma/client';
import { type ClassValue, clsx } from 'clsx';
import { startOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { twMerge } from 'tailwind-merge';

/**
 * Set the date to the start of the day in the specified time zone.
 * @param date - The date to set to the start of the day.
 * @param timeZone - The time zone to set the date to.
 * @returns The date set to the start of the day in the specified time zone.
 */
export function setToStartOfDayInTimeZone(date: Date, timeZone: string) {
  // Convert the date to the specified time zone
  const zonedDate = toZonedTime(date, timeZone);

  // Set to start of day in that time zone
  const startOfDayDate = startOfDay(zonedDate);

  // Convert back to UTC
  return fromZonedTime(startOfDayDate, timeZone);
}

/**
 * Check if the date is currently another day in the specified time zone.
 * @param date - The date to check.
 * @param timeZone - The time zone to check the date in.
 * @returns True if the date is another day in the specified time zone, false otherwise.
 */
export function isCurrentlyAnotherDayInTimeZone(date: Date, timeZone: string) {
  const localDate = new Date();
  const zonedDate = toZonedTime(localDate, timeZone);
  return date.getDate() !== zonedDate.getDate();
}

/**
 * Get the current date in the specified time zone.
 * @param timeZone - The time zone to get the date in.
 * @returns The current date in the specified time zone.
 */
export function todayInTimeZone(timeZone: string) {
  return toZonedTime(new Date(), timeZone);
}

/**
 * Merge class names.
 * @param inputs - The class names to merge.
 * @returns The merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format the currency.
 * @param amount - The amount to format.
 * @param currency - The currency to format.
 * @returns The formatted currency.
 */
export function formatCurrency(amount: number, currency: Currency) {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Compares two dates and returns true if they are equal days, months, and years, false otherwise.
 * @param date1 - The first date to compare.
 * @param date2 - The second date to compare.
 * @returns True if the dates are equal, false otherwise.
 */
export function areEqualDates(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
}
/**
 * Check if the date is in the range.
 * @param date - The date to check.
 * @param range - The range to check the date in.
 * @returns True if the date is in the range, false otherwise.
 */
export function isDateInRange(date: Date, range: { start: Date; end: Date }) {
  // Check if all dates are the same
  if (areEqualDates(date, range.start) && areEqualDates(date, range.end)) {
    return true;
  }
  return date >= range.start && date <= range.end;
}

/**
 * Get the locale for the current user.
 * @returns The locale for the current user.
 */
export function getLocale() {
  if (typeof window !== 'undefined') {
    return navigator.language || 'en-US';
  }
  return 'en-US';
}

/**
 * Format the currency symbol.
 * @param currency - The currency to format.
 * @returns The formatted currency symbol.
 */
export function formatCurrencySymbol(currency: Currency) {
  return new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency: currency,
  })
    .format(1)
    .replace(/\d+/g, '')
    .replace('.', '')
    .trim();
}

/**
 * Format the timezone in a human-readable way.
 * @param timeZone - The time zone to format.
 * @returns The formatted time zone.
 */
export function formatTimezone(timeZone: string) {
  try {
    const formatter = new Intl.DateTimeFormat(getLocale(), {
      timeZone,
      timeZoneName: 'long',
    })
      .formatToParts(new Date())
      .find((part) => part.type === 'timeZoneName');
    if (!formatter) {
      return timeZone;
    }
    return formatter.value;
  } catch (error) {
    return timeZone;
  }
}

/**
 * Format the time in a human-readable way in user's locale.
 * @param hhmm - The time to format in the format "HH:MM"
 * @returns The formatted time.
 * @example
 *     formatHHMMDate("12:30") // "12:30 PM"
 */
export function formatHHMMDate(hhmm: string) {
  const [hh, mm] = hhmm.split(':').map(Number);
  const hours = Number.parseInt(hh.toString());
  const minutes = Number.parseInt(mm.toString());

  const formatter = new Intl.DateTimeFormat(getLocale(), {
    hour: '2-digit',
    minute: '2-digit',
  });

  return formatter.format(new Date(0, 0, 0, hours, minutes));
}
