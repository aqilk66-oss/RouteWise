import createFirestoreService from './baseFirestoreService';
import { COLLECTIONS, ATTENDANCE_STATUS } from '../../constants/collections';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  serverTimestamp,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../../firebase/firebaseConfig';

const baseService = createFirestoreService(COLLECTIONS.ATTENDANCE);

/**
 * Valid state transitions for Student Transport Attendance
 *
 * Normal Path:
 *   notRecorded -> boarded -> droppedOff
 *
 * Alternate Path:
 *   notRecorded -> absent
 *
 * Invalid:
 *   droppedOff -> boarded
 *   absent -> droppedOff
 *   notRecorded -> droppedOff
 *   completed historical trip -> new boarding (unless explicitly corrected by authorized staff)
 */
export const isValidAttendanceTransition = (currentStatus, targetStatus) => {
  const current = currentStatus || ATTENDANCE_STATUS.NOT_RECORDED;

  if (current === targetStatus) return true; // Idempotent same-state is valid

  switch (current) {
    case ATTENDANCE_STATUS.NOT_RECORDED:
      return targetStatus === ATTENDANCE_STATUS.BOARDED || targetStatus === ATTENDANCE_STATUS.ABSENT;
    case ATTENDANCE_STATUS.BOARDED:
      return targetStatus === ATTENDANCE_STATUS.DROPPED_OFF;
    case ATTENDANCE_STATUS.ABSENT:
      return false; // Absent cannot move to boarded/droppedOff without explicit admin correction
    case ATTENDANCE_STATUS.DROPPED_OFF:
      return false; // Terminal journey state
    default:
      return false;
  }
};

/**
 * Attendance Domain Firestore Service Foundation
 */
export const attendanceService = {
  ...baseService,

  /**
   * Helper to validate state transition
   */
  validateTransition: isValidAttendanceTransition,

  /**
   * Record student boarding on an active trip
   */
  recordBoarding: async ({
    tripId,
    studentId,
    driverId,
    busId,
    routeId,
    stopId = null,
    stopName = null,
    markedBy = 'driver'
  }) => {
    if (!studentId || !tripId) {
      throw new Error('Attendance requires studentId and tripId.');
    }

    // Check existing record for this trip + student
    const existingList = await baseService.getAll({
      filters: [
        ['tripId', '==', tripId],
        ['studentId', '==', studentId]
      ],
      max: 1
    });

    const nowIso = new Date().toISOString();
    const todayDate = nowIso.split('T')[0];

    if (existingList.length > 0) {
      const existing = existingList[0];
      if (!isValidAttendanceTransition(existing.status, ATTENDANCE_STATUS.BOARDED)) {
        throw new Error(`Cannot mark boarded: Student is currently in status "${existing.status}".`);
      }

      await baseService.update(existing.id, {
        status: ATTENDANCE_STATUS.BOARDED,
        boardedAt: nowIso,
        pickupStopId: stopId || existing.pickupStopId || null,
        pickupStopName: stopName || existing.pickupStopName || null,
        driverId: driverId || existing.driverId || null,
        busId: busId || existing.busId || null,
        routeId: routeId || existing.routeId || null,
        markedBy,
        updatedAt: nowIso
      });

      return { id: existing.id, status: ATTENDANCE_STATUS.BOARDED, boardedAt: nowIso };
    }

    // Create new attendance record
    const attendanceDocId = `ATT-${tripId.slice(-6)}-${studentId.slice(-6)}-${Date.now().toString().slice(-4)}`;
    return baseService.create({
      attendanceId: attendanceDocId,
      studentId,
      tripId,
      driverId: driverId || null,
      busId: busId || null,
      routeId: routeId || null,
      date: todayDate,
      status: ATTENDANCE_STATUS.BOARDED,
      boardedAt: nowIso,
      droppedOffAt: null,
      pickupStopId: stopId || null,
      pickupStopName: stopName || null,
      markedBy,
      createdAt: nowIso,
      updatedAt: nowIso
    });
  },

  /**
   * Record student marked absent
   */
  recordAbsence: async ({
    tripId,
    studentId,
    driverId,
    busId,
    routeId,
    reason = 'Unreported Absence',
    markedBy = 'driver'
  }) => {
    if (!studentId || !tripId) {
      throw new Error('Attendance requires studentId and tripId.');
    }

    const existingList = await baseService.getAll({
      filters: [
        ['tripId', '==', tripId],
        ['studentId', '==', studentId]
      ],
      max: 1
    });

    const nowIso = new Date().toISOString();
    const todayDate = nowIso.split('T')[0];

    if (existingList.length > 0) {
      const existing = existingList[0];
      if (!isValidAttendanceTransition(existing.status, ATTENDANCE_STATUS.ABSENT)) {
        throw new Error(`Cannot mark absent: Student is already "${existing.status}".`);
      }

      await baseService.update(existing.id, {
        status: ATTENDANCE_STATUS.ABSENT,
        absenceReason: reason,
        markedBy,
        updatedAt: nowIso
      });

      return { id: existing.id, status: ATTENDANCE_STATUS.ABSENT, absenceReason: reason };
    }

    const attendanceDocId = `ATT-${tripId.slice(-6)}-${studentId.slice(-6)}-${Date.now().toString().slice(-4)}`;
    return baseService.create({
      attendanceId: attendanceDocId,
      studentId,
      tripId,
      driverId: driverId || null,
      busId: busId || null,
      routeId: routeId || null,
      date: todayDate,
      status: ATTENDANCE_STATUS.ABSENT,
      absenceReason: reason,
      boardedAt: null,
      droppedOffAt: null,
      markedBy,
      createdAt: nowIso,
      updatedAt: nowIso
    });
  },

  /**
   * Record student drop-off at destination stop
   */
  recordDropOff: async ({
    tripId,
    studentId,
    driverId,
    busId,
    routeId,
    stopId = null,
    stopName = null,
    markedBy = 'driver'
  }) => {
    if (!studentId || !tripId) {
      throw new Error('Attendance requires studentId and tripId.');
    }

    const existingList = await baseService.getAll({
      filters: [
        ['tripId', '==', tripId],
        ['studentId', '==', studentId]
      ],
      max: 1
    });

    if (existingList.length === 0) {
      throw new Error('Cannot drop off student: Student has no recorded boarding record for this trip.');
    }

    const existing = existingList[0];
    if (existing.status !== ATTENDANCE_STATUS.BOARDED) {
      throw new Error(`Cannot drop off student: Student must be in "boarded" status (currently "${existing.status}").`);
    }

    const nowIso = new Date().toISOString();

    await baseService.update(existing.id, {
      status: ATTENDANCE_STATUS.DROPPED_OFF,
      droppedOffAt: nowIso,
      dropoffStopId: stopId || existing.dropoffStopId || null,
      dropoffStopName: stopName || existing.dropoffStopName || null,
      markedBy,
      updatedAt: nowIso
    });

    return { id: existing.id, status: ATTENDANCE_STATUS.DROPPED_OFF, droppedOffAt: nowIso };
  },

  /**
   * Controlled Attendance Correction mechanism for Admin / Transport Manager
   * Preserves full auditability with reason, oldStatus, newStatus, correctedBy, correctedAt
   */
  correctAttendance: async ({
    attendanceId,
    newStatus,
    reason,
    correctedBy,
    correctedByRole = 'admin'
  }) => {
    if (!attendanceId) throw new Error('Attendance correction requires attendanceId.');
    if (!newStatus) throw new Error('New attendance status is required.');
    if (!reason || reason.trim().length < 5) {
      throw new Error('A detailed operational reason (minimum 5 characters) is required for attendance correction.');
    }

    const existing = await baseService.getById(attendanceId);
    if (!existing) throw new Error('Attendance record not found.');

    const nowIso = new Date().toISOString();

    const correctionAuditEntry = {
      oldStatus: existing.status || ATTENDANCE_STATUS.NOT_RECORDED,
      newStatus,
      reason: reason.trim(),
      correctedBy: correctedBy || 'Staff Administrator',
      correctedByRole,
      correctedAt: nowIso
    };

    const correctionHistory = Array.isArray(existing.correctionHistory) 
      ? [...existing.correctionHistory, correctionAuditEntry]
      : [correctionAuditEntry];

    const updates = {
      status: newStatus,
      isCorrected: true,
      lastCorrection: correctionAuditEntry,
      correctionHistory,
      updatedAt: nowIso
    };

    // Adjust specific milestone timestamps if correcting into or out of states
    if (newStatus === ATTENDANCE_STATUS.BOARDED && !existing.boardedAt) {
      updates.boardedAt = nowIso;
    } else if (newStatus === ATTENDANCE_STATUS.DROPPED_OFF) {
      if (!existing.boardedAt) updates.boardedAt = existing.createdAt || nowIso;
      if (!existing.droppedOffAt) updates.droppedOffAt = nowIso;
    } else if (newStatus === ATTENDANCE_STATUS.ABSENT) {
      updates.absenceReason = reason;
    }

    await baseService.update(attendanceId, updates);
    return { ...existing, ...updates };
  },

  /**
   * Fetch attendance records for a specific trip
   */
  getTripAttendance: async (tripId) => {
    if (!tripId) return [];
    return baseService.getAll({
      filters: [['tripId', '==', tripId]],
      max: 150
    });
  },

  /**
   * Fetch student's personal transport attendance history (Student & Parent scope)
   */
  getStudentAttendanceHistory: async (studentId, { max = 50 } = {}) => {
    if (!studentId) return [];
    try {
      const records = await baseService.getAll({
        filters: [['studentId', '==', studentId]],
        max
      });

      // Sort by date/createdAt descending
      return records.sort((a, b) => {
        const timeA = new Date(a.date || a.createdAt || 0).getTime();
        const timeB = new Date(b.date || b.createdAt || 0).getTime();
        return timeB - timeA;
      });
    } catch (err) {
      console.warn('getStudentAttendanceHistory error:', err.message);
      return [];
    }
  },

  /**
   * Real-time listener for an active trip's attendance
   * Cleans up automatically via returned unsubscribe function
   */
  subscribeToTripAttendance: (tripId, onUpdate, onError) => {
    if (!tripId) {
      if (typeof onUpdate === 'function') onUpdate([]);
      return () => {};
    }

    try {
      const attendanceRef = collection(db, COLLECTIONS.ATTENDANCE);
      const q = query(
        attendanceRef,
        where('tripId', '==', tripId)
      );

      return onSnapshot(
        q,
        (snapshot) => {
          const records = [];
          snapshot.forEach((doc) => {
            records.push({ id: doc.id, ...doc.data() });
          });
          if (typeof onUpdate === 'function') onUpdate(records);
        },
        (error) => {
          console.warn(`Trip attendance listener error for ${tripId}:`, error);
          if (typeof onError === 'function') onError(error);
        }
      );
    } catch (err) {
      console.warn('Failed to establish trip attendance listener:', err);
      return () => {};
    }
  },

  /**
   * Compute authoritative attendance summary numbers for a trip
   */
  calculateSummary: (expectedStudents = [], attendanceRecords = []) => {
    const totalExpected = expectedStudents.length;
    const recordByStudentId = {};

    attendanceRecords.forEach((rec) => {
      recordByStudentId[rec.studentId] = rec;
    });

    let boarded = 0;
    let droppedOff = 0;
    let absent = 0;

    expectedStudents.forEach((student) => {
      const rec = recordByStudentId[student.id];
      const status = rec?.status;
      if (status === ATTENDANCE_STATUS.BOARDED) boarded++;
      else if (status === ATTENDANCE_STATUS.DROPPED_OFF) droppedOff++;
      else if (status === ATTENDANCE_STATUS.ABSENT) absent++;
    });

    const resolvedCount = boarded + droppedOff + absent;
    const pending = Math.max(0, totalExpected - resolvedCount);

    return {
      expected: totalExpected,
      boarded,
      droppedOff,
      absent,
      pending,
      isComplete: totalExpected > 0 && pending === 0,
      recordByStudentId
    };
  }
};

export default attendanceService;
