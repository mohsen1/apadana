import { Currency } from '@prisma/client';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

export function isDateInRange(date: Date, range: { start: Date; end: Date }) {
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
