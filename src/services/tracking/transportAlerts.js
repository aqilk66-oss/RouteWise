import { notificationService } from '../firestore/notificationService';
import { emailNotificationService } from '../email/emailNotificationService';
import { NOTIFICATION_TYPE, NOTIFICATION_PRIORITY } from '../../constants/collections';

/**
 * RouteWise TransportAlertGenerator
 * 
 * Central business logic dispatcher for operational transit milestones:
 * - Trip Started
 * - Trip Delayed
 * - Trip Cancelled
 * - Trip Completed
 * 
 * Enforces:
 * 1. Event idempotency (preventing duplicate alerts)
 * 2. Audience scoping (parents, students, operators)
 * 3. Priority categorization (Normal, Important, Urgent)
 * 4. Zero GPS coordinate spam
 */

// In-memory idempotency cache
const processedAlertIds = new Set();

export const transportAlerts = {
  /**
   * Dispatches notifications when an authorized driver commences a transit run
   */
  notifyTripStarted: async (trip, { routeName = 'Campus Corridor', busNumber = 'School Bus' } = {}) => {
    if (!trip?.id) return;
    const eventId = `START-${trip.id}-${trip.actualStartTime || Date.now()}`;
    if (processedAlertIds.has(eventId)) return;

    processedAlertIds.add(eventId);

    const title = `Trip Started: ${routeName}`;
    const message = `${busNumber} has departed the depot and is currently en route for ${routeName}. Waypoint progress is live.`;

    try {
      // 1. In-app broadcast for route stakeholders
      await notificationService.createNotification({
        userId: 'all',
        title,
        message,
        type: NOTIFICATION_TYPE.TRIP,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        recipientRole: 'parent',
        relatedTripId: trip.id,
        relatedRouteId: trip.routeId || null,
        relatedBusId: trip.busId || null,
        eventId,
      });

      // 2. Optional email notification (evaluated gracefully)
      await emailNotificationService.sendTransportAlertEmail({
        recipientEmail: 'dispatch@routewise.app', // Operational fallback
        recipientName: 'School Transport Community',
        eventType: 'Trip Started',
        routeName,
        busNumber,
        scheduledTime: trip.scheduledStartTime || 'Morning Run',
        message,
        eventId,
      });
    } catch (err) {
      console.warn('transportAlerts: notifyTripStarted warning:', err.message);
    }
  },

  /**
   * Dispatches urgent notifications when a driver or administrator reports a transit delay
   */
  notifyTripDelayed: async (trip, reason = 'Traffic Congestion', { routeName = 'Campus Corridor', busNumber = 'School Bus' } = {}) => {
    if (!trip?.id) return;
    const eventId = `DELAY-${trip.id}-${Date.now().toString().slice(-4)}`;
    if (processedAlertIds.has(eventId)) return;

    processedAlertIds.add(eventId);

    const title = `Transit Delay Advisory: ${busNumber}`;
    const message = `${busNumber} on ${routeName} is experiencing a delay due to: ${reason}. Please allow extra time for pickup and drop-off.`;

    try {
      // In-app alert marked URGENT
      await notificationService.createNotification({
        userId: 'all',
        title,
        message,
        type: NOTIFICATION_TYPE.DELAY,
        priority: NOTIFICATION_PRIORITY.URGENT,
        recipientRole: 'parent',
        relatedTripId: trip.id,
        relatedRouteId: trip.routeId || null,
        relatedBusId: trip.busId || null,
        eventId,
      });

      // Email notification attempt
      await emailNotificationService.sendTransportAlertEmail({
        recipientEmail: 'parents@routewise.app',
        recipientName: 'Guardian',
        eventType: 'Transit Delay',
        routeName,
        busNumber,
        scheduledTime: trip.scheduledStartTime || 'En Route',
        message,
        eventId,
      });
    } catch (err) {
      console.warn('transportAlerts: notifyTripDelayed warning:', err.message);
    }
  },

  /**
   * Dispatches critical notifications when a trip is cancelled
   */
  notifyTripCancelled: async (trip, reason = 'Severe Weather / Route Obstruction', { routeName = 'Campus Corridor', busNumber = 'School Bus' } = {}) => {
    if (!trip?.id) return;
    const eventId = `CANCEL-${trip.id}-${Date.now().toString().slice(-4)}`;
    if (processedAlertIds.has(eventId)) return;

    processedAlertIds.add(eventId);

    const title = `Trip Cancelled: ${routeName}`;
    const message = `Today's run for ${routeName} (${busNumber}) has been cancelled. Cause: ${reason}. Please make alternative guardian arrangements.`;

    try {
      await notificationService.createNotification({
        userId: 'all',
        title,
        message,
        type: NOTIFICATION_TYPE.CANCELLATION,
        priority: NOTIFICATION_PRIORITY.URGENT,
        recipientRole: 'all',
        relatedTripId: trip.id,
        relatedRouteId: trip.routeId || null,
        relatedBusId: trip.busId || null,
        eventId,
      });

      await emailNotificationService.sendTransportAlertEmail({
        recipientEmail: 'all@routewise.app',
        recipientName: 'Transport Community',
        eventType: 'Trip Cancellation',
        routeName,
        busNumber,
        scheduledTime: trip.scheduledStartTime || 'Scheduled Run',
        message,
        eventId,
      });
    } catch (err) {
      console.warn('transportAlerts: notifyTripCancelled warning:', err.message);
    }
  },

  /**
   * Dispatches completion notice when a trip concludes at depot
   */
  notifyTripCompleted: async (trip, { routeName = 'Campus Corridor', busNumber = 'School Bus' } = {}) => {
    if (!trip?.id) return;
    const eventId = `COMPLETE-${trip.id}`;
    if (processedAlertIds.has(eventId)) return;

    processedAlertIds.add(eventId);

    const title = `Trip Concluded: ${routeName}`;
    const message = `${busNumber} has safely completed all passenger drop-offs for ${routeName}.`;

    try {
      await notificationService.createNotification({
        userId: 'all',
        title,
        message,
        type: NOTIFICATION_TYPE.TRIP,
        priority: NOTIFICATION_PRIORITY.NORMAL,
        recipientRole: 'parent',
        relatedTripId: trip.id,
        relatedRouteId: trip.routeId || null,
        relatedBusId: trip.busId || null,
        eventId,
      });
    } catch (err) {
      console.warn('transportAlerts: notifyTripCompleted warning:', err.message);
    }
  },

  /**
   * Dispatches notifications when an authorized driver records a student boarding
   */
  notifyStudentBoarded: async ({ student, trip, stopName = 'Designated Stop', time = 'Current Run', busNumber = 'School Bus' }) => {
    if (!student?.id || !trip?.id) return;
    const eventId = `ATT-BOARD-${trip.id}-${student.id}`;
    if (processedAlertIds.has(eventId)) return;
    processedAlertIds.add(eventId);

    const studentName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Your child';
    const title = `${studentName} has boarded the bus`;
    const message = `${studentName} safely boarded ${busNumber} at ${stopName} at ${time}.`;

    try {
      // 1. In-app notification directly targeted to parent or student
      const targetUserId = student.primaryParentId || student.parentId || student.userId || 'all';
      await notificationService.createNotification({
        userId: targetUserId,
        title,
        message,
        type: NOTIFICATION_TYPE.ARRIVAL || 'arrival',
        priority: NOTIFICATION_PRIORITY.NORMAL,
        recipientRole: 'parent',
        relatedTripId: trip.id,
        relatedStudentId: student.id,
        eventId,
      });

      // 2. Optional event-based email notification
      if (student.parentEmail) {
        await emailNotificationService.sendTransportAlertEmail({
          recipientEmail: student.parentEmail,
          recipientName: student.parentName || 'Guardian',
          eventType: 'Student Boarded',
          routeName: trip.routeName || 'School Transit',
          busNumber,
          scheduledTime: time,
          message,
          eventId,
        });
      }
    } catch (err) {
      console.warn('transportAlerts: notifyStudentBoarded warning:', err.message);
    }
  },

  /**
   * Dispatches notifications when a student is recorded dropped off
   */
  notifyStudentDroppedOff: async ({ student, trip, stopName = 'Drop-off Zone', time = 'Current Run', busNumber = 'School Bus' }) => {
    if (!student?.id || !trip?.id) return;
    const eventId = `ATT-DROP-${trip.id}-${student.id}`;
    if (processedAlertIds.has(eventId)) return;
    processedAlertIds.add(eventId);

    const studentName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Your child';
    const title = `${studentName} has been dropped off`;
    const message = `${studentName} was dropped off from ${busNumber} at ${stopName} at ${time}.`;

    try {
      const targetUserId = student.primaryParentId || student.parentId || student.userId || 'all';
      await notificationService.createNotification({
        userId: targetUserId,
        title,
        message,
        type: NOTIFICATION_TYPE.ARRIVAL || 'arrival',
        priority: NOTIFICATION_PRIORITY.NORMAL,
        recipientRole: 'parent',
        relatedTripId: trip.id,
        relatedStudentId: student.id,
        eventId,
      });

      if (student.parentEmail) {
        await emailNotificationService.sendTransportAlertEmail({
          recipientEmail: student.parentEmail,
          recipientName: student.parentName || 'Guardian',
          eventType: 'Student Dropped Off',
          routeName: trip.routeName || 'School Transit',
          busNumber,
          scheduledTime: time,
          message,
          eventId,
        });
      }
    } catch (err) {
      console.warn('transportAlerts: notifyStudentDroppedOff warning:', err.message);
    }
  },

  /**
   * Dispatches notifications when a student is recorded absent for a trip
   */
  notifyStudentAbsent: async ({ student, trip, reason = 'Reported Absent' }) => {
    if (!student?.id || !trip?.id) return;
    const eventId = `ATT-ABSENT-${trip.id}-${student.id}`;
    if (processedAlertIds.has(eventId)) return;
    processedAlertIds.add(eventId);

    const studentName = student.fullName || `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Your child';
    const title = `${studentName} marked absent for transit`;
    const message = `${studentName} was marked absent for trip ${trip.routeName || trip.id}. Reason: ${reason}.`;

    try {
      const targetUserId = student.primaryParentId || student.parentId || student.userId || 'all';
      await notificationService.createNotification({
        userId: targetUserId,
        title,
        message,
        type: NOTIFICATION_TYPE.TRIP,
        priority: NOTIFICATION_PRIORITY.IMPORTANT,
        recipientRole: 'parent',
        relatedTripId: trip.id,
        relatedStudentId: student.id,
        eventId,
      });
    } catch (err) {
      console.warn('transportAlerts: notifyStudentAbsent warning:', err.message);
    }
  },

  /**
   * Dispatches operational warning if trip concludes with unresolved attendance
   */
  notifyUnresolvedAttendance: async ({ trip, unresolvedCount = 0 }) => {
    if (!trip?.id || unresolvedCount <= 0) return;
    const eventId = `ATT-UNRESOLVED-${trip.id}`;
    if (processedAlertIds.has(eventId)) return;
    processedAlertIds.add(eventId);

    const title = `Unresolved Attendance Notice: ${trip.routeName || trip.id}`;
    const message = `Trip concluded with ${unresolvedCount} student(s) still in unrecorded attendance status. Operations review recommended.`;

    try {
      await notificationService.createNotification({
        userId: 'all',
        title,
        message,
        type: NOTIFICATION_TYPE.SAFETY || 'safety',
        priority: NOTIFICATION_PRIORITY.IMPORTANT,
        recipientRole: 'admin',
        relatedTripId: trip.id,
        eventId,
      });
    } catch (err) {
      console.warn('transportAlerts: notifyUnresolvedAttendance warning:', err.message);
    }
  },
};

export default transportAlerts;
