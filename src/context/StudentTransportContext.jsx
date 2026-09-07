import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { studentService } from '../services/firestore/studentService';
import { busService } from '../services/firestore/busService';
import { routeService } from '../services/firestore/routeService';
import { stopService } from '../services/firestore/stopService';
import { tripService } from '../services/firestore/tripService';
import { notificationService } from '../services/firestore/notificationService';
import { attendanceService } from '../services/firestore/attendanceService';
import { TRIP_STATUS, RECORD_STATUS } from '../constants/collections';

const StudentTransportContext = createContext(null);

export const StudentTransportProvider = ({ children }) => {
  const { user, profile } = useAuth();

  const [studentRecord, setStudentRecord] = useState(null);
  const [assignedBus, setAssignedBus] = useState(null);
  const [assignedRoute, setAssignedRoute] = useState(null);
  const [routeStops, setRouteStops] = useState([]);
  const [studentTrips, setStudentTrips] = useState([]);
  const [todayTrip, setTodayTrip] = useState(null);
  const [studentNotifications, setStudentNotifications] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudentData = useCallback(async (isSilentRefresh = false) => {
    if (!user) return;
    if (isSilentRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // 1. Fetch Student Record associated with this user
      // Match by userId, document id, or student email/name
      let sRecord = null;
      try {
        const studentDoc = await studentService.getById(user.uid);
        if (studentDoc) sRecord = studentDoc;
      } catch (e) {
        console.warn('Direct student getById lookup fallback:', e.message);
      }

      if (!sRecord) {
        const allStudents = await studentService.getAll({ max: 50 });
        sRecord = allStudents.find(
          s => s.userId === user.uid || s.email === user.email || s.id === user.uid
        ) || allStudents[0] || null;
      }
      setStudentRecord(sRecord);

      // 2. Fetch Assigned Route & Sequential Stops
      if (sRecord?.routeId) {
        try {
          const [routeDoc, allStops] = await Promise.all([
            routeService.getById(sRecord.routeId),
            stopService.getAll({ max: 150 }),
          ]);
          setAssignedRoute(routeDoc);

          const filteredStops = allStops
            .filter(s => s.routeId === sRecord.routeId)
            .sort((a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0));
          setRouteStops(filteredStops);
        } catch (e) {
          console.warn('Route/stops lookup error:', e.message);
        }
      }

      // 3. Fetch Assigned Bus
      const busId = sRecord?.busId || assignedRoute?.assignedBusId;
      if (busId) {
        try {
          const busDoc = await busService.getById(busId);
          setAssignedBus(busDoc);
        } catch (e) {
          console.warn('Bus lookup error:', e.message);
        }
      }

      // 4. Fetch Trips associated with student's route or bus
      if (sRecord?.routeId || busId) {
        try {
          const allTrips = await tripService.getAll({ max: 50 });
          const relevantTrips = allTrips.filter(
            t => (sRecord.routeId && t.routeId === sRecord.routeId) || (busId && t.busId === busId)
          );
          setStudentTrips(relevantTrips);

          // Find active or scheduled trip for today
          const active = relevantTrips.find(
            t => t.status === TRIP_STATUS.IN_PROGRESS || t.status === 'inProgress'
          ) || relevantTrips.find(
            t => t.status === TRIP_STATUS.SCHEDULED || t.status === 'scheduled'
          ) || relevantTrips[0] || null;
          setTodayTrip(active);
        } catch (e) {
          console.warn('Trips lookup error:', e.message);
        }
      }

      // 5. Fetch Student Notifications
      try {
        const notifs = await notificationService.getAll({ max: 50 });
        const studentNotifs = notifs.filter(
          n => !n.recipientRole || n.recipientRole === 'all' || n.recipientRole === 'student' || n.userId === user.uid
        );
        setStudentNotifications(studentNotifs);
      } catch (e) {
        console.warn('Notification lookup error:', e.message);
      }

      // 6. Fetch Student's Attendance Records
      if (sRecord?.id) {
        try {
          const records = await attendanceService.getStudentAttendanceHistory(sRecord.id, { max: 30 });
          setAttendanceHistory(records);

          const todayStr = new Date().toISOString().split('T')[0];
          const latestToday = records.find(r => r.date === todayStr) || records[0] || null;
          setTodayAttendance(latestToday);
        } catch (e) {
          console.warn('Attendance lookup error:', e.message);
        }
      }

    } catch (err) {
      console.error('Error fetching student portal data:', err);
      setError('Unable to load student transport information.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, assignedRoute?.assignedBusId]);

  useEffect(() => {
    fetchStudentData();
  }, [fetchStudentData]);

  // Pickup & dropoff station details
  const pickupInfo = useMemo(() => {
    if (!studentRecord) return null;
    const stopName = studentRecord.pickupStop || 'Scheduled Morning Crossing';
    const foundStop = routeStops.find(s => s.name === stopName || s.id === studentRecord.pickupStopId);
    return {
      name: stopName,
      address: foundStop?.address || 'Designated School Bus Station',
      time: foundStop?.pickupTime || '07:35 AM',
    };
  }, [studentRecord, routeStops]);

  const dropoffInfo = useMemo(() => {
    if (!studentRecord) return null;
    const stopName = studentRecord.dropoffStop || 'School Main Drop-off Zone';
    const foundStop = routeStops.find(s => s.name === stopName || s.id === studentRecord.dropoffStopId);
    return {
      name: stopName,
      address: foundStop?.address || 'Campus Gate & Terminal',
      time: foundStop?.dropoffTime || '03:30 PM',
    };
  }, [studentRecord, routeStops]);

  const unreadCount = useMemo(() => {
    return studentNotifications.filter(n => !n.read).length;
  }, [studentNotifications]);

  const value = {
    studentRecord,
    assignedBus,
    assignedRoute,
    routeStops,
    studentTrips,
    todayTrip,
    studentNotifications,
    attendanceHistory,
    todayAttendance,
    pickupInfo,
    dropoffInfo,
    unreadCount,
    loading,
    refreshing,
    error,
    refreshData: () => fetchStudentData(true),
  };

  return (
    <StudentTransportContext.Provider value={value}>
      {children}
    </StudentTransportContext.Provider>
  );
};

export const useStudentTransport = () => {
  const context = useContext(StudentTransportContext);
  if (!context) {
    throw new Error('useStudentTransport must be used within a StudentTransportProvider');
  }
  return context;
};

export default StudentTransportContext;
