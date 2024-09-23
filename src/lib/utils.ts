import { Currency, ListingInventory } from '@prisma/client';
import { type ClassValue, clsx } from 'clsx';
import { startOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { DateValue } from 'react-aria';
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
  const [hours, minutes] = hhmm.split(':').map((part) => Number.parseInt(part));

  const formatter = new Intl.DateTimeFormat(getLocale(), {
    hour: '2-digit',
    minute: '2-digit',
  });

  return formatter.format(new Date(0, 0, 0, hours, minutes));
}

/**
 * Check if the date is unavailable in the inventory.
 * @param date - The date to check.
 * @param inventory - The inventory to check the date in.
 * @param listingTimeZone - The time zone of the listing.
 * @returns True if the date is unavailable, false otherwise.
 */
export function isDateUnavailable(
  date: DateValue,
  inventory: ListingInventory[],
  listingTimeZone: string,
) {
  const inventoryForDate = inventory.find((inventory) => {
    const zonedDate = date.toDate(listingTimeZone);
    return areEqualDates(zonedDate, inventory.date);
  });
  if (!inventoryForDate) {
    return true;
  }
  return !inventoryForDate.isAvailable;
}

/**
 * Check if all dates in the range are available in the inventory.
 * @param range - The range to check.
 * @param inventory - The inventory to check the dates in.
 * @param listingTimeZone - The time zone of the listing.
 * @returns True if all dates in the range are available, false otherwise.
 */
export function areAllDatesAvailable(
  range: { start: DateValue; end: DateValue },
  inventory: ListingInventory[],
  listingTimeZone: string,
) {
  // clone the date values to avoid mutating the original values
  let start = range.start.add({ days: 0 });
  const end = range.end.add({ days: 0 });
  while (start <= end) {
    if (isDateUnavailable(start, inventory, listingTimeZone)) {
      return false;
    }
    start = start.add({ days: 1 });
  }
  return true;
}

/**
 * Retries an async function a specified number of times with a delay between attempts.
 * @param fn The async function to retry.
 * @param retries The number of retries.
 * @param delay The delay between retries in milliseconds.
 * @returns The result of the async function.
 */
export function retryAsync<T>(
  fn: () => Promise<T>,
  retries: number,
  delay: number,
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        if (retries > 0) {
          setTimeout(attempt, delay);
          retries--;
        } else {
          reject(error);
        }
      }
    };
    attempt();
  });
}
