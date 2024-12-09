/**
 * Returns an array of dates between start and end dates (inclusive)
 */
export function getDatesInRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);

  // Reset time to midnight to ensure consistent date comparison
  current.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
