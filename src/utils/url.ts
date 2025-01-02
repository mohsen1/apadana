const BASE_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://apadana.app';

export function createUrl(path: string): string {
  return `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function createVerificationUrl(code: string, email: string): string {
  return createUrl(`verify-email?code=${code}&email=${encodeURIComponent(email)}`);
}

export function createPasswordResetUrl(token: string, email: string): string {
  return createUrl(`reset-password?token=${token}&email=${encodeURIComponent(email)}`);
}

export function createListingUrl(listingId: string): string {
  return createUrl(`listing/${listingId}`);
}

export function createBookingUrl(bookingId: string): string {
  return createUrl(`booking/${bookingId}`);
}

export function createProfileUrl(params: URLSearchParams): string {
  return createUrl(`user/profile?${params.toString()}`);
}

export function createSettingsUrl(): string {
  return createUrl('settings');
}

export function createLoginUrl(): string {
  return createUrl('login');
}

export function createSignupUrl(): string {
  return createUrl('signup');
}

/**
 * Validates a URL string and throws an error if invalid
 */
export function assertUrl(urlString: unknown): asserts urlString is URL {
  try {
    new URL(urlString as string);
  } catch {
    throw new Error(`${String(urlString)} is not a valid URL`);
  }
}
