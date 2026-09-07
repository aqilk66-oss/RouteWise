import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';
import { COLLECTIONS } from '../../constants/collections';

const GLOBAL_CONFIG_DOC_ID = 'global';

/**
 * System Configuration Service
 * Manages platform parameters, maintenance mode flags, and institutional operational rules.
 */
export const systemConfigService = {
  /**
   * Retrieves global system configuration
   */
  getSystemConfig: async () => {
    try {
      const docRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, GLOBAL_CONFIG_DOC_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      }

      // Default initial configuration
      return {
        platformName: 'RouteWise Transit Platform',
        organizationName: 'RouteWise Unified District',
        defaultTimezone: 'America/New_York',
        maintenanceMode: false,
        maintenanceMessage: 'RouteWise is undergoing scheduled system upgrades. Transport services remain fully operational.',
        allowPublicRegistration: true,
        supportEmail: 'dispatch@routewise.org',
        supportPhone: '+1 (555) 019-8234',
        emergencyHotline: '+1 (555) 911-BUS1',
        sessionTimeoutMinutes: 60,
        requireTwoFactorForAdmins: false,
      };
    } catch (err) {
      console.warn('Failed to fetch system config:', err.message);
      return {
        platformName: 'RouteWise Transit Platform',
        maintenanceMode: false,
      };
    }
  },

  /**
   * Updates system configuration
   */
  updateSystemConfig: async (updates) => {
    const docRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, GLOBAL_CONFIG_DOC_ID);
    const payload = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, payload, { merge: true });
    return payload;
  },

  /**
   * Toggles system maintenance mode
   */
  setMaintenanceMode: async (enabled, message = null) => {
    const docRef = doc(db, COLLECTIONS.SYSTEM_CONFIG, GLOBAL_CONFIG_DOC_ID);
    const payload = {
      maintenanceMode: enabled,
      updatedAt: serverTimestamp(),
    };
    if (message) payload.maintenanceMessage = message;
    await setDoc(docRef, payload, { merge: true });
    return payload;
  },
};

export default systemConfigService;
