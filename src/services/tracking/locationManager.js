/**
 * RouteWise LocationManager
 * 
 * Manages device GPS acquisition via the browser Geolocation API.
 * Responsibilities:
 * - Permission requests & normalization
 * - watchPosition / clearWatch lifecycle management
 * - Coordinate boundary validation (lat [-90, 90], lng [-180, 180])
 * - Stationary jitter suppression via Haversine distance threshold
 * - Controlled transmission throttling (avoids continuous/high-frequency writes)
 * - Error categorization (PERMISSION_DENIED, POSITION_UNAVAILABLE, TIMEOUT, UNKNOWN)
 */

export const LOCATION_PERMISSION_STATE = {
  GRANTED: 'granted',
  PROMPT: 'prompt',
  DENIED: 'denied',
  UNAVAILABLE: 'unavailable',
};

export const LOCATION_ERROR_CODES = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE: 'POSITION_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
};

/**
 * Calculate distance in meters between two lat/lng coordinates (Haversine formula)
 */
export const calculateDistanceMeters = (lat1, lon1, lat2, lon2) => {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Validate geographic coordinate bounds
 */
export const isValidCoordinates = (latitude, longitude) => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') return false;
  if (isNaN(latitude) || isNaN(longitude)) return false;
  return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
};

class LocationManager {
  constructor() {
    this.watchId = null;
    this.isWatching = false;
    this.lastPosition = null;
    this.lastTransmittedAt = 0;
    
    // Throttling configuration
    this.MIN_INTERVAL_MS = 6000; // Minimum 6 seconds between transmitted updates
    this.MIN_DISTANCE_METERS = 15; // Minimum 15 meters movement required if interval < 20s
    this.MAX_INTERVAL_MS = 25000; // Force update if vehicle moved slightly after 25s
    this.ACCURACY_THRESHOLD_METERS = 200; // Flag or filter wildly inaccurate readings
  }

  /**
   * Check browser Geolocation capability
   */
  isSupported() {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  }

  /**
   * Query permission status where supported by browser Permissions API
   */
  async getPermissionStatus() {
    if (!this.isSupported()) return LOCATION_PERMISSION_STATE.UNAVAILABLE;

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state; // 'granted' | 'prompt' | 'denied'
      } catch (e) {
        // Fallback if permission query is unsupported
        return LOCATION_PERMISSION_STATE.PROMPT;
      }
    }
    return LOCATION_PERMISSION_STATE.PROMPT;
  }

  /**
   * Start watching device location with controlled callback
   * @param {Function} onLocationUpdate - Callback receiving validated, throttled location data
   * @param {Function} onError - Callback receiving normalized error
   * @param {Object} options - Custom geolocation options
   */
  startWatching({ onLocationUpdate, onError, options = {} }) {
    if (!this.isSupported()) {
      if (onError) {
        onError({
          code: LOCATION_ERROR_CODES.POSITION_UNAVAILABLE,
          message: 'Browser geolocation is not supported on this device.',
        });
      }
      return null;
    }

    if (this.isWatching) {
      this.stopWatching();
    }

    const geoOptions = {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
      ...options,
    };

    const handleSuccess = (position) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const timestamp = position.timestamp || Date.now();

      // Validate bounds
      if (!isValidCoordinates(latitude, longitude)) {
        console.warn('RouteWise LocationManager: Discarding invalid coordinates:', latitude, longitude);
        return;
      }

      const now = Date.now();
      const timeSinceLastUpdate = now - this.lastTransmittedAt;

      // Distance moved since last transmitted point
      let distanceMoved = 0;
      if (this.lastPosition) {
        distanceMoved = calculateDistanceMeters(
          this.lastPosition.latitude,
          this.lastPosition.longitude,
          latitude,
          longitude
        );
      }

      // Throttling & Jitter suppression rules:
      // 1. If first position, always transmit
      // 2. If time elapsed < MIN_INTERVAL_MS, skip unless moved significantly (> 40m)
      // 3. If time elapsed >= MIN_INTERVAL_MS, transmit if distance > MIN_DISTANCE_METERS or time > MAX_INTERVAL_MS
      const isFirst = !this.lastPosition;
      const isIntervalElapsed = timeSinceLastUpdate >= this.MIN_INTERVAL_MS;
      const hasSignificantMovement = distanceMoved >= this.MIN_DISTANCE_METERS;
      const isMaxIntervalReached = timeSinceLastUpdate >= this.MAX_INTERVAL_MS;
      const isHighSpeedJump = distanceMoved > 40;

      const shouldTransmit =
        isFirst ||
        (isIntervalElapsed && (hasSignificantMovement || isMaxIntervalReached)) ||
        isHighSpeedJump;

      if (shouldTransmit) {
        this.lastPosition = { latitude, longitude, accuracy, heading, speed };
        this.lastTransmittedAt = now;

        const normalizedData = {
          latitude,
          longitude,
          accuracy: accuracy ? Math.round(accuracy) : null,
          isLowAccuracy: accuracy ? accuracy > this.ACCURACY_THRESHOLD_METERS : false,
          heading: typeof heading === 'number' && !isNaN(heading) ? Math.round(heading) : null,
          speed: typeof speed === 'number' && !isNaN(speed) && speed >= 0 ? Math.round(speed * 3.6) : null, // km/h
          timestamp,
        };

        if (onLocationUpdate) {
          onLocationUpdate(normalizedData);
        }
      }
    };

    const handleError = (error) => {
      let code = LOCATION_ERROR_CODES.UNKNOWN;
      let message = 'Unable to acquire location.';

      switch (error.code) {
        case 1: // PERMISSION_DENIED
          code = LOCATION_ERROR_CODES.PERMISSION_DENIED;
          message = 'Location permission was denied. Please enable location in your browser settings to share your bus position.';
          break;
        case 2: // POSITION_UNAVAILABLE
          code = LOCATION_ERROR_CODES.POSITION_UNAVAILABLE;
          message = 'Location information is currently unavailable. Please verify GPS is enabled.';
          break;
        case 3: // TIMEOUT
          code = LOCATION_ERROR_CODES.TIMEOUT;
          message = 'Location request timed out. Checking signal...';
          break;
        default:
          code = LOCATION_ERROR_CODES.UNKNOWN;
          message = error.message || 'An unknown location error occurred.';
      }

      if (onError) {
        onError({ code, message, originalError: error });
      }
    };

    try {
      this.watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, geoOptions);
      this.isWatching = true;
      return this.watchId;
    } catch (err) {
      handleError(err);
      return null;
    }
  }

  /**
   * Stop watching location and clear watcher handle
   */
  stopWatching() {
    if (this.watchId !== null && this.isSupported()) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isWatching = false;
    this.lastPosition = null;
    this.lastTransmittedAt = 0;
  }
}

export const locationManager = new LocationManager();
export default locationManager;
