export const LOCATION_CONFIG = {
  GOOGLE_MAPS_API_KEY: '', // Optional Google Geocoding API Key
  HIGH_ACCURACY_TIMEOUT: 20000,
  BALANCED_ACCURACY_TIMEOUT: 15000,
  MAX_AGE: 60000,
  DEFAULT_LATITUDE: 13.0827, // Chennai, Tamil Nadu default coordinates
  DEFAULT_LONGITUDE: 80.2707,
};

export const isGeocodingAvailable = () => {
  return Boolean(LOCATION_CONFIG.GOOGLE_MAPS_API_KEY && LOCATION_CONFIG.GOOGLE_MAPS_API_KEY.trim().length > 0);
};

export default LOCATION_CONFIG;
