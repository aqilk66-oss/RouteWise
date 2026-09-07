import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, NOTIFICATION_TYPE, NOTIFICATION_PRIORITY } from '../../constants/collections';
import { collection, query, where, orderBy, limit, onSnapshot, writeBatch, doc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const baseService = createFirestoreService(COLLECTIONS.NOTIFICATIONS);

/**
 * Notifications Domain Firestore Service
 * Supports scoped queries, real-time listener subscriptions, and batch mark-as-read.
 */
export const notificationService = {
  ...baseService,

  /**
   * Create an event-driven notification with idempotency support
   */
  createNotification: async ({
    userId,
    title,
    message,
    type = NOTIFICATION_TYPE.GENERAL,
    priority = NOTIFICATION_PRIORITY.NORMAL,
    recipientRole = null,
    relatedTripId = null,
    relatedRouteId = null,
    relatedBusId = null,
    eventId = null,
  }) => {
    if (!userId || !title || !message) {
      throw new Error('Notification requires userId, title, and message.');
    }

    return baseService.create({
      notificationId: `NOTIF-${Date.now().toString().slice(-6)}`,
      userId,
      title,
      message,
      type,
      priority,
      read: false,
      recipientRole: recipientRole || null,
      relatedTripId: relatedTripId || null,
      relatedRouteId: relatedRouteId || null,
      relatedBusId: relatedBusId || null,
      eventId: eventId || null,
    });
  },

  /**
   * Query user's recent notifications
   */
  getUserNotifications: async (userId, max = 50) => {
    return baseService.getAll({
      filters: [['userId', '==', userId]],
      sortBy: 'createdAt',
      sortDirection: 'desc',
      max,
    });
  },

  /**
   * Mark a single notification as read
   */
  markAsRead: async (notificationId) => {
    return baseService.update(notificationId, { read: true });
  },

  /**
   * Mark all notifications for a specific user as read
   */
  markAllAsRead: async (userId) => {
    if (!userId) return;
    const colRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(colRef, where('userId', '==', userId), where('read', '==', false));
    const snap = await getDocs(q);

    if (snap.empty) return;

    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      batch.update(doc(db, COLLECTIONS.NOTIFICATIONS, d.id), { read: true });
    });
    await batch.commit();
  },

  /**
   * Subscribe to real-time notifications for the authenticated user
   * Returns a cleanup unsubscribe function.
   */
  subscribeToUserNotifications: (userId, onUpdate, onError) => {
    if (!userId) {
      if (onUpdate) onUpdate([]);
      return () => {};
    }

    const colRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(
      colRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notifs = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        if (onUpdate) onUpdate(notifs);
      },
      (error) => {
        console.warn(`notificationService: Snapshot listener error on user [${userId}]:`, error.message);
        if (onError) onError(error);
      }
    );

    return unsubscribe;
  },
};

export default notificationService;
