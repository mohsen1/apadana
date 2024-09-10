import { Currency } from '@prisma/client';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: Currency) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
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
 * Get the locale for the current user.
 * @todo: Implement this function.
 * @returns The locale for the current user.
 */
export function getLocale() {
  return 'en-US';
}
