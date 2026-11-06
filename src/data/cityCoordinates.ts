/**
 * Geo-coordinates for airline office cities & airport hubs
 * Used for automated Blogger post "Location" settings (Google Maps pin & geo-meta)
 */
export interface CityGeoLocation {
  name: string;
  lat: number;
  lng: number;
}

export const KNOWN_CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  // US Major Airline Hubs & Office Cities
  'bozeman': { lat: 45.6769, lng: -111.0429 },
  'honolulu': { lat: 21.3069, lng: -157.8583 },
  'atlanta': { lat: 33.7490, lng: -84.3880 },
  'madison': { lat: 43.0731, lng: -89.4012 },
  'green bay': { lat: 44.5192, lng: -88.0198 },
  'greensboro': { lat: 36.0726, lng: -79.7920 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'dallas': { lat: 32.7767, lng: -96.7970 },
  'fort worth': { lat: 32.7555, lng: -97.3308 },
  'denver': { lat: 39.7392, lng: -104.9903 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'orlando': { lat: 28.5383, lng: -81.3792 },
  'new york': { lat: 40.7128, lng: -74.0060 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'washington': { lat: 38.9072, lng: -77.0369 },
  'phoenix': { lat: 33.4484, lng: -112.0740 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'las vegas': { lat: 36.1699, lng: -115.1398 },
  'minneapolis': { lat: 44.9778, lng: -93.2650 },
  'detroit': { lat: 42.3314, lng: -83.0458 },
  'philadelphia': { lat: 39.9526, lng: -75.1652 },
  'charlotte': { lat: 35.2271, lng: -80.8431 },
  'salt lake city': { lat: 40.7608, lng: -111.8910 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  'tampa': { lat: 27.9506, lng: -82.4572 },
  'portland': { lat: 45.5152, lng: -122.6784 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'st. louis': { lat: 38.6270, lng: -90.1994 },
  'nashville': { lat: 36.1627, lng: -86.7816 },
  'kansas city': { lat: 39.0997, lng: -94.5786 },
  'cleveland': { lat: 41.4993, lng: -81.6944 },
  'cincinnati': { lat: 39.1031, lng: -84.5120 },
  'pittsburgh': { lat: 40.4406, lng: -79.9959 },
  'columbus': { lat: 39.9612, lng: -82.9988 },
  'indianapolis': { lat: 39.7684, lng: -86.1581 },
  'milwaukee': { lat: 43.0389, lng: -87.9065 },
  'raleigh': { lat: 35.7796, lng: -78.6382 },
  'anchorage': { lat: 61.2181, lng: -149.9003 },
  'fairbanks': { lat: 64.8378, lng: -147.7164 },
  
  // International Hubs
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'frankfurt': { lat: 50.1109, lng: 8.6821 },
  'amsterdam': { lat: 52.3676, lng: 4.9041 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'doha': { lat: 25.2854, lng: 51.5310 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'vancouver': { lat: 49.2827, lng: -123.1207 },
  'mexico city': { lat: 19.4326, lng: -99.1332 },
  'bogota': { lat: 4.7110, lng: -74.0721 }
};

export function getCoordinatesForCity(city: string, country: string = 'United States'): { lat: number; lng: number } {
  const normalized = (city || '').trim().toLowerCase();
  
  for (const [key, coords] of Object.entries(KNOWN_CITY_COORDINATES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }

  // Fallback default coordinates (Center of US or global)
  if (country.toLowerCase().includes('united states') || country.toLowerCase().includes('usa')) {
    return { lat: 39.8283, lng: -98.5795 }; // Geographic center of contiguous US
  }
  return { lat: 40.7128, lng: -74.0060 };
}
