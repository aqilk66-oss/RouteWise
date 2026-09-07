import {
  studentService,
  busService,
  driverService,
  routeService,
  tripService,
  attendanceService,
} from '../firestore';
import { TRIP_STATUS, ATTENDANCE_STATUS } from '../../constants/collections';

/**
 * Calculates start and end timestamps/dates for a given period identifier
 */
export const getPeriodDateRange = (periodKey = 'last7days', customStart = null, customEnd = null) => {
  const now = new Date();
  let start = new Date();
  let end = new Date();

  switch (periodKey) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'yesterday':
      start.setDate(now.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(now.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last7days':
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'last30days':
      start.setDate(now.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'thisMonth':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'thisYear':
      start = new Date(now.getFullYear(), 0, 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case 'custom':
      if (customStart) {
        start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
      }
      if (customEnd) {
        end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
      }
      break;

    default:
      start.setDate(now.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return {
    start,
    end,
    startDateStr: start.toISOString().split('T')[0],
    endDateStr: end.toISOString().split('T')[0],
  };
};

/**
 * Filter an array of items with a date field or createdAt property within a range
 */
export const filterByDateRange = (items = [], startDateStr, endDateStr, dateField = 'date') => {
  if (!items || items.length === 0) return [];
  return items.filter((item) => {
    let itemDate = item[dateField];
    if (!itemDate && item.createdAt) {
      itemDate = item.createdAt.split('T')[0];
    }
    if (!itemDate) return true; // Include items without dates as fallback if needed
    return itemDate >= startDateStr && itemDate <= endDateStr;
  });
};

/**
 * Centralized RouteWise Report Service
 */
export const reportService = {
  /**
   * Fetch all raw data required for report calculations
   */
  fetchAllBaseData: async () => {
    const [students, buses, drivers, routes, trips, attendance] = await Promise.all([
      studentService.getAll({ max: 500 }),
      busService.getAll({ max: 150 }),
      driverService.getAll({ max: 150 }),
      routeService.getAll({ max: 100 }),
      tripService.getAll({ max: 500 }),
      attendanceService.getAll({ max: 1000 }),
    ]);

    return { students, buses, drivers, routes, trips, attendance };
  },

  /**
   * Compute High-Level Executive Overview Metrics
   */
  computeOverviewMetrics: ({ students = [], buses = [], drivers = [], routes = [], trips = [], attendance = [] }, dateRange) => {
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === 'active' || !s.status).length;

    const totalBuses = buses.length;
    const activeBuses = buses.filter((b) => b.status === 'active' || b.status === 'assigned').length;

    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter((d) => d.status === 'active' || !d.status).length;

    const totalRoutes = routes.length;
    const activeRoutes = routes.filter((r) => r.status === 'active' || !r.status).length;

    const periodTrips = filterByDateRange(trips, dateRange.startDateStr, dateRange.endDateStr);
    const completedTrips = periodTrips.filter((t) => t.status === TRIP_STATUS.COMPLETED || t.status === 'completed').length;
    const delayedTrips = periodTrips.filter((t) => t.status === TRIP_STATUS.DELAYED || t.status === 'delayed').length;
    const cancelledTrips = periodTrips.filter((t) => t.status === TRIP_STATUS.CANCELLED || t.status === 'cancelled').length;

    const periodAttendance = filterByDateRange(attendance, dateRange.startDateStr, dateRange.endDateStr);
    const boarded = periodAttendance.filter((a) => a.status === ATTENDANCE_STATUS.BOARDED || a.status === ATTENDANCE_STATUS.DROPPED_OFF).length;
    const totalAttendanceRecords = periodAttendance.length;
    const boardingRate = totalAttendanceRecords > 0 ? Math.round((boarded / totalAttendanceRecords) * 100) : 0;

    const totalCapacity = buses.reduce((acc, b) => acc + (Number(b.capacity) || 0), 0);
    const capacityUtilization = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

    const onTimeRate = periodTrips.length > 0 
      ? Math.max(0, Math.round(((periodTrips.length - delayedTrips - cancelledTrips) / periodTrips.length) * 100))
      : 100;

    return {
      totalStudents,
      activeStudents,
      totalBuses,
      activeBuses,
      totalDrivers,
      activeDrivers,
      totalRoutes,
      activeRoutes,
      totalTrips: periodTrips.length,
      completedTrips,
      delayedTrips,
      cancelledTrips,
      onTimeRate,
      totalCapacity,
      capacityUtilization,
      boardingRate,
      periodTrips,
      periodAttendance,
    };
  },

  /**
   * Compute Detailed Trip Analytics
   */
  computeTripAnalytics: (trips = [], routes = [], buses = [], drivers = [], dateRange) => {
    const periodTrips = filterByDateRange(trips, dateRange.startDateStr, dateRange.endDateStr);

    let scheduled = 0;
    let completed = 0;
    let inProgress = 0;
    let delayed = 0;
    let cancelled = 0;

    const delayReasons = {};
    const tripsByDay = {};

    periodTrips.forEach((t) => {
      const status = t.status || 'scheduled';
      if (status === TRIP_STATUS.COMPLETED || status === 'completed') completed++;
      else if (status === TRIP_STATUS.IN_PROGRESS || status === 'inProgress') inProgress++;
      else if (status === TRIP_STATUS.DELAYED || status === 'delayed') delayed++;
      else if (status === TRIP_STATUS.CANCELLED || status === 'cancelled') cancelled++;
      else scheduled++;

      // Delay reasons aggregation
      if (t.delayReason) {
        delayReasons[t.delayReason] = (delayReasons[t.delayReason] || 0) + 1;
      }

      // Group by date for daily trend
      const dateKey = t.date || (t.createdAt ? t.createdAt.split('T')[0] : 'Unknown');
      if (dateKey !== 'Unknown') {
        if (!tripsByDay[dateKey]) {
          tripsByDay[dateKey] = { date: dateKey, total: 0, completed: 0, delayed: 0 };
        }
        tripsByDay[dateKey].total++;
        if (status === TRIP_STATUS.COMPLETED || status === 'completed') tripsByDay[dateKey].completed++;
        if (status === TRIP_STATUS.DELAYED || status === 'delayed') tripsByDay[dateKey].delayed++;
      }
    });

    const total = periodTrips.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const delayRate = total > 0 ? Math.round((delayed / total) * 100) : 0;
    const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

    const sortedDailyTrend = Object.values(tripsByDay).sort((a, b) => a.date.localeCompare(b.date));

    return {
      total,
      scheduled,
      completed,
      inProgress,
      delayed,
      cancelled,
      completionRate,
      delayRate,
      cancellationRate,
      delayReasons,
      dailyTrend: sortedDailyTrend,
      tripsList: periodTrips,
    };
  },

  /**
   * Compute Detailed Attendance Analytics
   */
  computeAttendanceAnalytics: (attendance = [], students = [], trips = [], dateRange) => {
    const periodRecords = filterByDateRange(attendance, dateRange.startDateStr, dateRange.endDateStr);

    let boarded = 0;
    let droppedOff = 0;
    let absent = 0;
    let pending = 0;

    const attendanceByDay = {};

    periodRecords.forEach((a) => {
      const st = a.status || ATTENDANCE_STATUS.NOT_RECORDED;
      if (st === ATTENDANCE_STATUS.BOARDED) boarded++;
      else if (st === ATTENDANCE_STATUS.DROPPED_OFF) droppedOff++;
      else if (st === ATTENDANCE_STATUS.ABSENT) absent++;
      else pending++;

      const dateKey = a.date || (a.createdAt ? a.createdAt.split('T')[0] : 'Unknown');
      if (dateKey !== 'Unknown') {
        if (!attendanceByDay[dateKey]) {
          attendanceByDay[dateKey] = { date: dateKey, boarded: 0, absent: 0, droppedOff: 0, total: 0 };
        }
        attendanceByDay[dateKey].total++;
        if (st === ATTENDANCE_STATUS.BOARDED) attendanceByDay[dateKey].boarded++;
        if (st === ATTENDANCE_STATUS.DROPPED_OFF) attendanceByDay[dateKey].droppedOff++;
        if (st === ATTENDANCE_STATUS.ABSENT) attendanceByDay[dateKey].absent++;
      }
    });

    const total = periodRecords.length;
    const expected = total > 0 ? total : students.length;
    const resolved = boarded + droppedOff + absent;
    const unresolved = Math.max(0, expected - resolved);

    const boardingRate = expected > 0 ? Math.round(((boarded + droppedOff) / expected) * 100) : 0;
    const dropoffRate = (boarded + droppedOff) > 0 ? Math.round((droppedOff / (boarded + droppedOff)) * 100) : 0;
    const absenceRate = expected > 0 ? Math.round((absent / expected) * 100) : 0;

    const sortedDailyTrend = Object.values(attendanceByDay).sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalRecords: total,
      expected,
      boarded,
      droppedOff,
      absent,
      unresolved,
      boardingRate,
      dropoffRate,
      absenceRate,
      dailyTrend: sortedDailyTrend,
      recordsList: periodRecords,
    };
  },

  /**
   * Compute Detailed Bus Analytics
   */
  computeBusAnalytics: (buses = [], trips = [], students = [], dateRange) => {
    const periodTrips = filterByDateRange(trips, dateRange.startDateStr, dateRange.endDateStr);

    let active = 0;
    let available = 0;
    let maintenance = 0;
    let assigned = 0;
    let retired = 0;

    const busTripCount = {};
    periodTrips.forEach((t) => {
      if (t.busId) {
        busTripCount[t.busId] = (busTripCount[t.busId] || 0) + 1;
      }
    });

    const busStudentCount = {};
    students.forEach((s) => {
      if (s.busId) {
        busStudentCount[s.busId] = (busStudentCount[s.busId] || 0) + 1;
      }
    });

    const enrichedBuses = buses.map((b) => {
      const st = (b.status || 'available').toLowerCase();
      if (st === 'active') active++;
      else if (st === 'maintenance') maintenance++;
      else if (st === 'assigned') assigned++;
      else if (st === 'retired') retired++;
      else available++;

      const cap = Number(b.capacity) || 40;
      const enrolled = busStudentCount[b.id] || 0;
      const utilization = cap > 0 ? Math.round((enrolled / cap) * 100) : 0;
      const tripsCompleted = busTripCount[b.id] || 0;

      return {
        ...b,
        enrolledStudents: enrolled,
        capacityNumber: cap,
        utilizationPct: Math.min(utilization, 100),
        tripsInPeriod: tripsCompleted,
      };
    });

    const totalCapacity = buses.reduce((acc, b) => acc + (Number(b.capacity) || 0), 0);
    const overallUtilization = totalCapacity > 0 ? Math.round((students.length / totalCapacity) * 100) : 0;

    return {
      totalBuses: buses.length,
      active,
      available,
      maintenance,
      assigned,
      retired,
      totalCapacity,
      overallUtilization,
      busesList: enrichedBuses,
    };
  },

  /**
   * Compute Detailed Route Analytics
   */
  computeRouteAnalytics: (routes = [], trips = [], students = [], stops = [], dateRange) => {
    const periodTrips = filterByDateRange(trips, dateRange.startDateStr, dateRange.endDateStr);

    let active = 0;
    let inactive = 0;

    const tripsPerRoute = {};
    const delaysPerRoute = {};

    periodTrips.forEach((t) => {
      if (t.routeId) {
        tripsPerRoute[t.routeId] = (tripsPerRoute[t.routeId] || 0) + 1;
        if (t.status === TRIP_STATUS.DELAYED || t.status === 'delayed') {
          delaysPerRoute[t.routeId] = (delaysPerRoute[t.routeId] || 0) + 1;
        }
      }
    });

    const studentsPerRoute = {};
    students.forEach((s) => {
      if (s.routeId) {
        studentsPerRoute[s.routeId] = (studentsPerRoute[s.routeId] || 0) + 1;
      }
    });

    const stopsPerRoute = {};
    stops.forEach((st) => {
      if (st.routeId) {
        stopsPerRoute[st.routeId] = (stopsPerRoute[st.routeId] || 0) + 1;
      }
    });

    const enrichedRoutes = routes.map((r) => {
      const st = (r.status || 'active').toLowerCase();
      if (st === 'active') active++;
      else inactive++;

      const routeTrips = tripsPerRoute[r.id] || 0;
      const routeDelays = delaysPerRoute[r.id] || 0;
      const enrolled = studentsPerRoute[r.id] || 0;
      const stopCount = stopsPerRoute[r.id] || 0;
      const onTimeRate = routeTrips > 0 ? Math.round(((routeTrips - routeDelays) / routeTrips) * 100) : 100;

      return {
        ...r,
        tripsCount: routeTrips,
        delaysCount: routeDelays,
        studentsCount: enrolled,
        stopsCount: stopCount,
        onTimeRate: Math.max(0, onTimeRate),
      };
    });

    return {
      totalRoutes: routes.length,
      active,
      inactive,
      routesList: enrichedRoutes,
    };
  },

  /**
   * Compute Detailed Driver Analytics
   */
  computeDriverAnalytics: (drivers = [], trips = [], dateRange) => {
    const periodTrips = filterByDateRange(trips, dateRange.startDateStr, dateRange.endDateStr);

    const driverTripMetrics = {};
    periodTrips.forEach((t) => {
      const dId = t.driverId;
      if (dId) {
        if (!driverTripMetrics[dId]) {
          driverTripMetrics[dId] = { total: 0, completed: 0, delayed: 0, cancelled: 0 };
        }
        driverTripMetrics[dId].total++;
        if (t.status === TRIP_STATUS.COMPLETED || t.status === 'completed') driverTripMetrics[dId].completed++;
        if (t.status === TRIP_STATUS.DELAYED || t.status === 'delayed') driverTripMetrics[dId].delayed++;
        if (t.status === TRIP_STATUS.CANCELLED || t.status === 'cancelled') driverTripMetrics[dId].cancelled++;
      }
    });

    let active = 0;
    let onDuty = 0;

    const enrichedDrivers = drivers.map((d) => {
      const st = (d.status || 'active').toLowerCase();
      if (st === 'active') active++;
      if (st === 'on-duty' || st === 'onduty') onDuty++;

      const m = driverTripMetrics[d.id] || { total: 0, completed: 0, delayed: 0, cancelled: 0 };
      const onTimeRate = m.total > 0 ? Math.round(((m.total - m.delayed - m.cancelled) / m.total) * 100) : 100;

      return {
        ...d,
        assignedTrips: m.total,
        completedTrips: m.completed,
        delayedTrips: m.delayed,
        cancelledTrips: m.cancelled,
        onTimeRate: Math.max(0, onTimeRate),
      };
    });

    return {
      totalDrivers: drivers.length,
      active,
      onDuty,
      driversList: enrichedDrivers,
    };
  },

  /**
   * Compute Detailed Student Transport Analytics
   */
  computeStudentAnalytics: (students = [], routes = [], buses = []) => {
    const byGrade = {};
    const byRoute = {};
    let totalEnrolled = students.length;

    students.forEach((s) => {
      const grade = s.grade || 'Unassigned';
      byGrade[grade] = (byGrade[grade] || 0) + 1;

      const routeName = s.routeName || s.routeId || 'Unassigned';
      byRoute[routeName] = (byRoute[routeName] || 0) + 1;
    });

    return {
      totalStudents: totalEnrolled,
      byGrade,
      byRoute,
      studentsList: students,
    };
  },
};

export default reportService;
