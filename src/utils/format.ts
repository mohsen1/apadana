/**
 * Formats a number as a price with currency symbol
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted price string
 */
export function formatPrice(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
