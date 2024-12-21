import { createLogger } from '@/utils/logger';

const API_KEY = process.env.GOOGLE_MAPS_BACKEND_API_KEY;
const API_BASE_URL = 'https://maps.googleapis.com/maps/api';

const logger = createLogger(__filename);

/**
 * Fetches the time zone for a given latitude and longitude using the Google Maps API.
 * @param lat - The latitude to fetch the time zone for.
 * @param lng - The longitude to fetch the time zone for.
 * @returns The time zone ID for the given latitude and longitude.
 */
export async function getTimeZone(lat: number, lng: number): Promise<string> {
  if (!API_KEY || API_KEY.startsWith('fake_maps_key_')) {
    logger.error('API_KEY is not set, falling back to user timezone');
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const timeZoneUrl = `${API_BASE_URL}/timezone/json`;
  const url = `${timeZoneUrl}?location=${lat},${lng}&timestamp=${timestamp}&key=${API_KEY}`;
  const response = await fetch(url);
  const data = (await response.json()) as {
    status: string;
    timeZoneId: string;
    error_message: string;
  };

  if (data.status === 'OK') {
    return data.timeZoneId;
  } else {
    throw new Error(
      `Error fetching time zone: ${data.status}: ${data.error_message}\n for ${lat}, ${lng}`,
    );
  }
}
