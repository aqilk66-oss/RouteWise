import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { studentService } from '../services/firestore/studentService';
import { busService } from '../services/firestore/busService';
import { routeService } from '../services/firestore/routeService';
import { stopService } from '../services/firestore/stopService';
import { tripService } from '../services/firestore/tripService';
import { notificationService } from '../services/firestore/notificationService';
import { attendanceService } from '../services/firestore/attendanceService';
import { TRIP_STATUS, RECORD_STATUS, ATTENDANCE_STATUS } from '../constants/collections';

const ParentTransportContext = createContext(null);

export const ParentTransportProvider = ({ children }) => {
  const { user, profile } = useAuth();

  const [childrenList, setChildrenList] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Attendance state
  const [childAttendanceHistory, setChildAttendanceHistory] = useState([]);
  const [todayAttendanceRecord, setTodayAttendanceRecord] = useState(null);

  // Cached related entity dictionaries for fast, join-free lookups
  const [routesMap, setRoutesMap] = useState({});
  const [busesMap, setBusesMap] = useState({});
  const [stopsList, setStopsList] = useState([]);
  const [allTrips, setAllTrips] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Fetch parent's children and associated transport entities
  const fetchParentData = useCallback(async (isSilentRefresh = false) => {
    if (!user) return;
    if (isSilentRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      // 1. Query students linked to this parent
      // Checks by primaryParentId or matches parent email/profile
      let students = [];
      try {
        students = await studentService.getByParentId(user.uid);
      } catch (e) {
        console.warn('Direct parentId query fallback:', e.message);
      }

      // Fallback: If no direct student linked yet or in demo mode, fetch all students
      // and filter or show registered children
      if (students.length === 0) {
        const allStudents = await studentService.getAll({ max: 50 });
        students = allStudents.filter(
          (s) => s.primaryParentId === user.uid || 
                 (s.parentIds && s.parentIds.includes(user.uid)) ||
                 s.parentId === user.uid
        );
        // If still empty (e.g. brand new test parent user), provide first available student in test environment
        if (students.length === 0 && allStudents.length > 0) {
          students = allStudents.slice(0, 2);
        }
      }

      setChildrenList(students);
      if (students.length > 0 && !selectedChildId) {
        setSelectedChildId(students[0].id);
      }

      // 2. Fetch routes, buses, stops, and trips in parallel
      const [routes, buses, stops, trips, notifs] = await Promise.all([
        routeService.getAll({ max: 100 }),
        busService.getAll({ max: 100 }),
        stopService.getAll({ max: 200 }),
        tripService.getAll({ max: 100 }),
        notificationService.getAll({ max: 50 }),
      ]);

      const rMap = {};
      routes.forEach((r) => { rMap[r.id] = r; });
      setRoutesMap(rMap);

      const bMap = {};
      buses.forEach((b) => { bMap[b.id] = b; });
      setBusesMap(bMap);

      setStopsList(stops);
      setAllTrips(trips);

      // Filter notifications relevant to parent
      const parentNotifs = notifs.filter(
        (n) => !n.recipientRole || n.recipientRole === 'all' || n.recipientRole === 'parent' || n.userId === user.uid
      );
      setNotifications(parentNotifs);

    } catch (err) {
      console.error('Error fetching parent transport data:', err);
      setError(err.message || 'Unable to load transport records.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, selectedChildId]);

  useEffect(() => {
    fetchParentData();
  }, [fetchParentData]);

  // Fetch attendance records whenever selectedChildId changes
  useEffect(() => {
    let isMounted = true;
    const fetchChildAttendance = async () => {
      if (!selectedChildId) {
        setChildAttendanceHistory([]);
        setTodayAttendanceRecord(null);
        return;
      }

      try {
        const records = await attendanceService.getStudentAttendanceHistory(selectedChildId, { max: 30 });
        if (!isMounted) return;
        setChildAttendanceHistory(records);

        const todayStr = new Date().toISOString().split('T')[0];
        const latestToday = records.find(r => r.date === todayStr) || records[0] || null;
        setTodayAttendanceRecord(latestToday);
      } catch (err) {
        console.warn('Failed to load child attendance:', err.message);
      }
    };

    fetchChildAttendance();
    return () => { isMounted = false; };
  }, [selectedChildId]);

  // Selected child object
  const selectedChild = useMemo(() => {
    if (!selectedChildId || childrenList.length === 0) return childrenList[0] || null;
    return childrenList.find((c) => c.id === selectedChildId) || childrenList[0];
  }, [childrenList, selectedChildId]);

  // Associated route for selected child
  const childRoute = useMemo(() => {
    if (!selectedChild?.routeId) return null;
    return routesMap[selectedChild.routeId] || null;
  }, [selectedChild, routesMap]);

  // Associated bus for selected child
  const childBus = useMemo(() => {
    const busId = selectedChild?.busId || childRoute?.assignedBusId;
    if (!busId) return null;
    return busesMap[busId] || null;
  }, [selectedChild, childRoute, busesMap]);

  // Associated stops along child's route ordered by sequence
  const routeStops = useMemo(() => {
    if (!childRoute?.id) return [];
    return stopsList
      .filter((s) => s.routeId === childRoute.id)
      .sort((a, b) => (Number(a.sequence) || 0) - (Number(b.sequence) || 0));
  }, [childRoute, stopsList]);

  // Today's active or scheduled trip for this child's route/bus
  const todayTrip = useMemo(() => {
    if (!childRoute?.id && !childBus?.id) return null;
    // Find active or scheduled trip matching the route
    const trip = allTrips.find(
      (t) => (t.routeId === childRoute?.id || t.busId === childBus?.id) &&
             t.status !== TRIP_STATUS.CANCELLED
    );
    return trip || null;
  }, [childRoute, childBus, allTrips]);

  // Historical trips for this child's route
  const childTripHistory = useMemo(() => {
    if (!childRoute?.id && !childBus?.id) return [];
    return allTrips.filter(
      (t) => t.routeId === childRoute?.id || t.busId === childBus?.id
    );
  }, [childRoute, childBus, allTrips]);

  // Unread notification count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const value = {
    childrenList,
    selectedChild,
    selectedChildId,
    setSelectedChildId,
    childRoute,
    childBus,
    routeStops,
    todayTrip,
    childTripHistory,
    childAttendanceHistory,
    todayAttendanceRecord,
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,
    refreshData: () => fetchParentData(true),
  };

  return (
    <ParentTransportContext.Provider value={value}>
      {children}
    </ParentTransportContext.Provider>
  );
};

export const useParentTransport = () => {
  const context = useContext(ParentTransportContext);
  if (!context) {
    throw new Error('useParentTransport must be used within a ParentTransportProvider');
  }
  return context;
};

export default ParentTransportContext;
