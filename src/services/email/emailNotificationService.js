import emailjs from '@emailjs/browser';

/**
 * RouteWise Notification Email Service
 * 
 * Specifically dedicated to meaningful operational transport events (Delays, Cancellations, Safety Alerts).
 * Coexists cleanly with the public inquiry service in emailService.js.
 * 
 * Free-Tier Awareness & Credential Safety:
 * - Does NOT invent fake credentials.
 * - If VITE_EMAILJS_SERVICE_ID / VITE_EMAILJS_TEMPLATE_ID / VITE_EMAILJS_PUBLIC_KEY are missing,
 *   it logs a clean developer note and returns gracefully, preserving in-app notifications.
 */

// In-memory idempotency cache to prevent duplicate email dispatches
const processedEmailEvents = new Set();

export const emailNotificationService = {
  /**
   * Check whether EmailJS notification environment variables are active
   */
  isConfigured: () => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    return Boolean(serviceId && templateId && publicKey);
  },

  /**
   * Dispatch an operational transport email alert
   * @param {Object} payload - Structured email parameters
   */
  sendTransportAlertEmail: async ({
    recipientEmail,
    recipientName = 'Guardian',
    eventType = 'Transport Update',
    routeName = 'Campus Route',
    busNumber = 'School Bus',
    scheduledTime = 'Scheduled Run',
    message = '',
    eventId = null,
    dashboardUrl = window?.location?.origin || 'https://routewise.app',
  }) => {
    // 1. Idempotency Check: Prevent duplicate email dispatches for the same event
    if (eventId && processedEmailEvents.has(eventId)) {
      return { success: true, skipped: true, reason: 'Duplicate event already processed' };
    }

    // 2. Validate recipient
    if (!recipientEmail || !recipientEmail.includes('@')) {
      return { success: false, error: 'Invalid recipient email address.' };
    }

    // 3. Check credentials without failing the calling in-app notification flow
    if (!emailNotificationService.isConfigured()) {
      if (eventId) processedEmailEvents.add(eventId);
      return {
        success: true,
        mocked: true,
        message: 'EmailJS credentials not configured in .env. In-app notification delivered successfully.',
      };
    }

    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_NOTIFICATION_TEMPLATE_ID || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const templateParams = {
      to_name: recipientName,
      to_email: recipientEmail,
      event_type: eventType,
      route_name: routeName,
      bus_number: busNumber,
      scheduled_time: scheduledTime,
      alert_message: message,
      dashboard_url: dashboardUrl,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    try {
      const response = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      if (eventId) processedEmailEvents.add(eventId);
      return { success: true, response };
    } catch (err) {
      console.warn('emailNotificationService: EmailJS transmission note:', err.message);
      // Secondary email failure does NOT throw to prevent breaking primary Firestore operations
      return { success: false, error: err.message };
    }
  },
};

export default emailNotificationService;
