import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { COLLECTIONS } from '../../constants/collections';

/**
 * Default Institutional & Operational Parameters
 */
export const DEFAULT_SETTINGS = {
  transport: {
    pickupWindowMins: 15,
    dropoffWindowMins: 15,
    tripGracePeriodMins: 5,
    etaDelayThresholdMins: 5,
    maxSpeedLimitMph: 45,
    geofenceRadiusMeters: 150,
    trackingFreshnessSeconds: 30,
    trackingIntervalSeconds: 8,
    requireBoardingStatus: true,
    requireDropoffStatus: true,
    requireAttendanceBeforeTripComplete: true,
    allowDriverDelayReports: true,
  },
  system: {
    appName: 'RouteWise',
    tagline: 'Every Route, Under Control.',
    institutionName: 'Lincoln Heights Unified School District',
    schoolAddress: '1044 University Ave, Campus District, CA 94103',
    schoolPhone: '+1 (555) 438-9021',
    schoolEmail: 'transport@lincolnheights.edu',
    schoolWebsite: 'https://lincolnheights.edu/transport',
    operatingHoursStart: '06:30',
    operatingHoursEnd: '18:00',
    timeFormat: '12h',
    timezone: 'America/Los_Angeles',
    maintenanceMode: false,
    maintenanceMessage: 'System undergoing scheduled transportation database maintenance.',
  },
  notifications: {
    enableTripStartAlerts: true,
    enableDelayAlerts: true,
    enableCancellationAlerts: true,
    enableEmergencyBulletins: true,
    enableEmailDigest: true,
    enableParentSmsFallback: false,
    emailjsStatus: 'ready',
  },
};

// In-memory cache to prevent redundant reads
const settingsCache = {
  transport: null,
  system: null,
  notifications: null,
  lastFetched: {},
};

const CACHE_TTL_MS = 60000; // 1 minute local cache

/**
 * RouteWise Settings Service
 */
export const settingsService = {
  /**
   * Retrieve settings category with fallback to defaults
   */
  getSettingsCategory: async (category = 'transport', forceFresh = false) => {
    const validCategories = ['transport', 'system', 'notifications'];
    if (!validCategories.includes(category)) {
      category = 'transport';
    }

    const now = Date.now();
    if (!forceFresh && settingsCache[category] && (now - (settingsCache.lastFetched[category] || 0) < CACHE_TTL_MS)) {
      return settingsCache[category];
    }

    try {
      const docRef = doc(db, COLLECTIONS.SETTINGS, category);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        const merged = { ...DEFAULT_SETTINGS[category], ...data };
        settingsCache[category] = merged;
        settingsCache.lastFetched[category] = now;
        return merged;
      }

      // If document does not exist yet, cache and return safe defaults without creating clutter
      settingsCache[category] = DEFAULT_SETTINGS[category];
      settingsCache.lastFetched[category] = now;
      return DEFAULT_SETTINGS[category];
    } catch (err) {
      console.warn(`Settings read warning for [${category}]:`, err.message);
      return DEFAULT_SETTINGS[category];
    }
  },

  /**
   * Save settings category to Firestore with audit metadata
   */
  updateSettingsCategory: async (category, data, updatedBy = 'system') => {
    if (!category || !DEFAULT_SETTINGS[category]) {
      throw new Error(`Invalid settings category: ${category}`);
    }

    const payload = {
      ...data,
      updatedAt: serverTimestamp(),
      updatedBy: updatedBy || 'administrator',
    };

    const docRef = doc(db, COLLECTIONS.SETTINGS, category);
    await setDoc(docRef, payload, { merge: true });

    // Invalidate local cache and update
    settingsCache[category] = { ...DEFAULT_SETTINGS[category], ...data };
    settingsCache.lastFetched[category] = Date.now();

    // Broadcast change event for active services (e.g. tracking thresholds)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('routewise:settings_updated', {
        detail: { category, settings: settingsCache[category] }
      }));
    }

    return settingsCache[category];
  },

  /**
   * Get user-specific preferences stored on users/{uid}
   */
  getUserPreferences: async (uid, defaultPrefs = {}) => {
    if (!uid) return defaultPrefs;
    try {
      const userRef = doc(db, 'users', uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        return data.preferences || defaultPrefs;
      }
      return defaultPrefs;
    } catch (e) {
      console.warn('Failed to load user preferences:', e.message);
      return defaultPrefs;
    }
  },

  /**
   * Update user-specific preferences stored on users/{uid}
   */
  updateUserPreferences: async (uid, preferences) => {
    if (!uid) throw new Error('UID is required to update preferences.');
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      preferences,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Get tracking freshness thresholds (dynamically loaded or default)
   */
  getTrackingThresholds: async () => {
    const transport = await settingsService.getSettingsCategory('transport');
    const freshnessSeconds = Number(transport.trackingFreshnessSeconds) || 30;
    return {
      FRESH_MAX_MS: (freshnessSeconds / 2) * 1000,
      RECENT_MAX_MS: freshnessSeconds * 1000,
      STALE_MIN_MS: freshnessSeconds * 1000,
    };
  }
};

export default settingsService;
