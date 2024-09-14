const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const API_BASE_URL = 'https://maps.googleapis.com/maps/api';

/**
 * Fetches the time zone for a given latitude and longitude using the Google Maps API.
 * @param lat - The latitude to fetch the time zone for.
 * @param lng - The longitude to fetch the time zone for.
 * @returns The time zone ID for the given latitude and longitude.
 */
export async function getTimeZone(lat: number, lng: number) {
  const timestamp = Math.floor(Date.now() / 1000);
  const timeZoneUrl = `${API_BASE_URL}/timezone/json`;
  const url = `${timeZoneUrl}?location=${lat},${lng}&timestamp=${timestamp}&key=${GOOGLE_MAPS_API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === 'OK') {
    return data.timeZoneId;
  } else {
    throw new Error(
      `Error fetching time zone: ${data.status}: ${data.error_message}\n for ${lat}, ${lng}`,
    );
  }
}
