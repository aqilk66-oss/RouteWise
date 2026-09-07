import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { driverService } from '../services/firestore/driverService';
import { busService } from '../services/firestore/busService';
import { routeService } from '../services/firestore/routeService';
import { stopService } from '../services/firestore/stopService';
import { tripService } from '../services/firestore/tripService';
import { studentService } from '../services/firestore/studentService';
import { attendanceService } from '../services/firestore/attendanceService';
import { notificationService } from '../services/firestore/notificationService';
import { transportAlerts } from '../services/tracking/transportAlerts';
import { TRIP_STATUS, RECORD_STATUS, ATTENDANCE_STATUS } from '../constants/collections';

const DriverTransportContext = createContext(null);

export const DriverTransportProvider = ({ children }) => {
  const { user, profile } = useAuth();

  const [driverProfile, setDriverProfile] = useState(null);
  const [assignedBus, setAssignedBus] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [driverTrips, setDriverTrips] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [routeStudents, setRouteStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [driverNotifications, setDriverNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Load complete driver operational universe based on driver identity & assignments
  const fetchDriverData = useCallback(async (isSilentRefresh = false) => {
    if (!user) return;
    if (isSilentRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // 1. Fetch Driver Profile by userId
      let dProfile = await driverService.getByUserId(user.uid);
      
      // Fallback for demonstration / test simulator mode if account not yet linked to driver document:
      if (!dProfile) {
        const allDrivers = await driverService.getAll({ max: 20 });
        if (allDrivers.length > 0) {
          dProfile = allDrivers.find(d => d.userId === user.uid || d.email === user.email) || allDrivers[0];
        }
      }
      setDriverProfile(dProfile);

      // 2. Fetch Trips assigned to this driver or matching driverId / bus
      const driverId = dProfile?.id || dProfile?.driverId || user.uid;
      let trips = [];
      try {
        trips = await tripService.getTripsByDriver(driverId);
      } catch (e) {
        console.warn('Driver trip query fallback:', e.message);
      }

      // If empty in demo environment, fallback to trips with matching bus or general fleet trips
      if (trips.length === 0) {
        const allTrips = await tripService.getAll({ max: 50 });
        trips = allTrips.filter(t => t.driverId === driverId || t.busId === dProfile?.assignedBusId);
        if (trips.length === 0 && allTrips.length > 0) {
          trips = allTrips.slice(0, 5);
        }
      }
      setDriverTrips(trips);

      // Find active or immediate scheduled trip
      const live = trips.find(t => t.status === TRIP_STATUS.IN_PROGRESS || t.status === 'inProgress') 
        || trips.find(t => t.status === TRIP_STATUS.SCHEDULED || t.status === 'scheduled')
        || trips[0] || null;
      setActiveTrip(live);

      // 3. Resolve Assigned Bus
      const busId = live?.busId || dProfile?.assignedBusId;
      if (busId) {
        try {
          const busDoc = await busService.getById(busId);
          setAssignedBus(busDoc);
        } catch (e) {
          console.warn('Bus fetch error:', e.message);
        }
      }

      // 4. Resolve Assigned Route & Stops
      const routeId = live?.routeId || dProfile?.assignedRouteId;
      if (routeId) {
        try {
          const [routeDoc, allStops] = await Promise.all([
            routeService.getById(routeId),
            stopService.getAll({ max: 200 }),
          ]);
          setAssignedRoute(routeDoc);

          const filteredStops = allStops
            .filter(s => s.routeId === routeId)
            .sort((a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0));
          setRouteStops(filteredStops);
        } catch (e) {
          console.warn('Route/Stops fetch error:', e.message);
        }
      }

      // 5. Resolve Students assigned to this Route / Bus
      if (routeId || busId) {
        try {
          const allStudents = await studentService.getAll({ max: 200 });
          const students = allStudents.filter(s => 
            (routeId && s.routeId === routeId) || (busId && s.busId === busId)
          );
          setRouteStudents(students);
        } catch (e) {
          console.warn('Student fetch error:', e.message);
        }
      }

      // 6. Fetch Attendance Records for Active Trip
      if (live?.id) {
        try {
          const records = await attendanceService.getTripAttendance(live.id);
          setAttendanceRecords(records);
        } catch (e) {
          console.warn('Attendance fetch error:', e.message);
        }
      }

      // 7. Fetch Driver Notifications
      try {
        const notifs = await notificationService.getAll({ max: 50 });
        const driverNotifs = notifs.filter(n => 
          !n.recipientRole || n.recipientRole === 'all' || n.recipientRole === 'driver' || n.userId === user.uid
        );
        setDriverNotifications(driverNotifs);
      } catch (e) {
        console.warn('Notification fetch error:', e.message);
      }

    } catch (err) {
      console.error('Error in DriverTransportProvider:', err);
      setError(err.message || 'Unable to load driver portal data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDriverData();
  }, [fetchDriverData]);

  // Real-time listener for active trip attendance records
  useEffect(() => {
    if (!activeTrip?.id) return;

    const unsubscribe = attendanceService.subscribeToTripAttendance(
      activeTrip.id,
      (liveRecords) => {
        setAttendanceRecords(liveRecords);
      },
      (err) => {
        console.warn('Driver attendance live sync error:', err.message);
      }
    );

    return () => unsubscribe();
  }, [activeTrip?.id]);

  // Operational Trip State Machine Controls:
  const startTrip = async (tripId) => {
    const target = driverTrips.find(t => t.id === tripId) || activeTrip;
    if (!target) throw new Error('Trip not found.');
    if (target.status !== TRIP_STATUS.SCHEDULED && target.status !== 'ready') {
      throw new Error('This trip cannot be started right now (must be scheduled or ready).');
    }

    const nowIso = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await tripService.update(target.id, {
      status: TRIP_STATUS.IN_PROGRESS,
      actualStartTime: nowIso,
      actualStartTimestamp: new Date().toISOString(),
    });

    if (target.busId) {
      try {
        await busService.update(target.busId, {
          status: 'active',
          currentTripId: target.id,
        });
      } catch (e) {
        console.warn('Bus update notice:', e.message);
      }
    }

    await transportAlerts.notifyTripStarted(target, {
      routeName: assignedRoute?.name || target.routeName || 'Campus Corridor',
      busNumber: assignedBus?.busNumber || target.busNumber || 'Fleet Vehicle',
    });

    await fetchDriverData(true);
  };

  const completeTrip = async (tripId) => {
    const target = driverTrips.find(t => t.id === tripId) || activeTrip;
    if (!target) throw new Error('Trip not found.');
    if (target.status !== TRIP_STATUS.IN_PROGRESS && target.status !== TRIP_STATUS.DELAYED && target.status !== 'inProgress' && target.status !== 'delayed') {
      throw new Error('Only active or delayed trips can be completed.');
    }

    // Enforce attendance policy from system settings
    try {
      const { settingsService } = await import('../services/settings/settingsService');
      const transportSettings = await settingsService.getSettingsCategory('transport');
      if (transportSettings?.requireAttendanceBeforeTripComplete) {
        if (attendanceSummary.boarded > 0) {
          throw new Error(`Cannot complete run: ${attendanceSummary.boarded} student(s) are still marked as Boarded and have not been dropped off.`);
        }
      }
    } catch (policyErr) {
      if (policyErr.message.startsWith('Cannot complete run:')) {
        throw policyErr;
      }
      console.warn('Transport settings check skipped:', policyErr.message);
    }

    // Check for unresolved students
    if (attendanceSummary.pending > 0) {
      await transportAlerts.notifyUnresolvedAttendance({
        trip: target,
        unresolvedCount: attendanceSummary.pending,
      });
    }

    const nowIso = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    await tripService.update(target.id, {
      status: TRIP_STATUS.COMPLETED,
      actualEndTime: nowIso,
      actualEndTimestamp: new Date().toISOString(),
    });

    if (target.busId) {
      try {
        await busService.update(target.busId, {
          status: 'available',
          currentTripId: null,
        });
      } catch (e) {
        console.warn('Bus update notice:', e.message);
      }
    }

    await transportAlerts.notifyTripCompleted(target, {
      routeName: assignedRoute?.name || target.routeName || 'Campus Corridor',
      busNumber: assignedBus?.busNumber || target.busNumber || 'Fleet Vehicle',
    });

    await fetchDriverData(true);
  };

  const reportDelay = async (tripId, reason = 'Traffic Congestion') => {
    const target = driverTrips.find(t => t.id === tripId) || activeTrip;
    if (!target) throw new Error('Trip not found.');

    await tripService.update(target.id, {
      status: TRIP_STATUS.DELAYED,
      delayReason: reason,
      delayReportedAt: new Date().toISOString(),
    });

    try {
      await transportAlerts.notifyTripDelayed(target, reason, {
        routeName: assignedRoute?.name || target.routeName || 'Campus Corridor',
        busNumber: assignedBus?.busNumber || target.busNumber || 'Fleet Vehicle',
      });
    } catch (e) {
      console.warn('Notification dispatch error:', e.message);
    }

    await fetchDriverData(true);
  };

  const updateStopProgression = async (tripId, stopId, stopName) => {
    const target = driverTrips.find(t => t.id === tripId) || activeTrip;
    if (!target) return;

    await tripService.update(target.id, {
      currentStopId: stopId,
      currentStopName: stopName,
      lastWaypointTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    await fetchDriverData(true);
  };

  // Mark Student Boarded
  const markBoarded = async (studentId, { stopId = null, stopName = null } = {}) => {
    if (!activeTrip?.id) throw new Error('No active trip to record attendance against.');

    const student = routeStudents.find(s => s.id === studentId);
    const resolvedStopName = stopName || student?.pickupStop || 'Scheduled Stop';

    await attendanceService.recordBoarding({
      tripId: activeTrip.id,
      studentId,
      driverId: driverProfile?.id || user.uid,
      busId: assignedBus?.id || activeTrip.busId,
      routeId: assignedRoute?.id || activeTrip.routeId,
      stopId,
      stopName: resolvedStopName,
      markedBy: driverProfile?.fullName || user.displayName || 'Driver Operator',
    });

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (student) {
      await transportAlerts.notifyStudentBoarded({
        student,
        trip: activeTrip,
        stopName: resolvedStopName,
        time: nowTime,
        busNumber: assignedBus?.busNumber || 'Assigned Bus',
      });
    }
  };

  // Mark Student Absent
  const markAbsent = async (studentId, reason = 'Unreported Absence') => {
    if (!activeTrip?.id) throw new Error('No active trip to record attendance against.');

    const student = routeStudents.find(s => s.id === studentId);

    await attendanceService.recordAbsence({
      tripId: activeTrip.id,
      studentId,
      driverId: driverProfile?.id || user.uid,
      busId: assignedBus?.id || activeTrip.busId,
      routeId: assignedRoute?.id || activeTrip.routeId,
      reason,
      markedBy: driverProfile?.fullName || user.displayName || 'Driver Operator',
    });

    if (student) {
      await transportAlerts.notifyStudentAbsent({
        student,
        trip: activeTrip,
        reason,
      });
    }
  };

  // Mark Student Dropped Off
  const markDroppedOff = async (studentId, { stopId = null, stopName = null } = {}) => {
    if (!activeTrip?.id) throw new Error('No active trip to record attendance against.');

    const student = routeStudents.find(s => s.id === studentId);
    const resolvedStopName = stopName || student?.dropoffStop || 'School Entrance';

    await attendanceService.recordDropOff({
      tripId: activeTrip.id,
      studentId,
      driverId: driverProfile?.id || user.uid,
      busId: assignedBus?.id || activeTrip.busId,
      routeId: assignedRoute?.id || activeTrip.routeId,
      stopId,
      stopName: resolvedStopName,
      markedBy: driverProfile?.fullName || user.displayName || 'Driver Operator',
    });

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (student) {
      await transportAlerts.notifyStudentDroppedOff({
        student,
        trip: activeTrip,
        stopName: resolvedStopName,
        time: nowTime,
        busNumber: assignedBus?.busNumber || 'Assigned Bus',
      });
    }
  };

  // Bulk boarding for students at a specific stop or selected list
  const markBulkBoarded = async (studentIds = [], { stopId = null, stopName = null } = {}) => {
    if (!activeTrip?.id) throw new Error('No active trip to record attendance against.');
    for (const sId of studentIds) {
      try {
        await markBoarded(sId, { stopId, stopName });
      } catch (err) {
        console.warn(`Bulk boarding error for ${sId}:`, err.message);
      }
    }
  };

  // Backward compatibility alias
  const markAttendance = async (studentId, status) => {
    if (status === ATTENDANCE_STATUS.BOARDED || status === 'boarded') {
      return markBoarded(studentId);
    } else if (status === ATTENDANCE_STATUS.ABSENT || status === 'absent') {
      return markAbsent(studentId);
    } else if (status === ATTENDANCE_STATUS.DROPPED_OFF || status === 'droppedOff') {
      return markDroppedOff(studentId);
    }
  };

  // Attendance metrics summary for current trip
  const attendanceSummary = useMemo(() => {
    return attendanceService.calculateSummary(routeStudents, attendanceRecords);
  }, [routeStudents, attendanceRecords]);

  const value = {
    driverProfile,
    assignedBus,
    assignedRoute,
    routeStops,
    driverTrips,
    activeTrip,
    routeStudents,
    attendanceRecords,
    attendanceSummary,
    driverNotifications,
    loading,
    refreshing,
    error,
    refreshData: () => fetchDriverData(true),
    startTrip,
    completeTrip,
    reportDelay,
    updateStopProgression,
    markBoarded,
    markAbsent,
    markDroppedOff,
    markBulkBoarded,
    markAttendance,
  };

  return (
    <DriverTransportContext.Provider value={value}>
      {children}
    </DriverTransportContext.Provider>
  );
};

export const useDriverTransport = () => {
  const context = useContext(DriverTransportContext);
  if (!context) {
    throw new Error('useDriverTransport must be used within a DriverTransportProvider');
  }
  return context;
};

export default DriverTransportContext;
