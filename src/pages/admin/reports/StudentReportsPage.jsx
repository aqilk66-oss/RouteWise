import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Download, 
  RefreshCw, 
  GraduationCap, 
  Route, 
  Bus, 
  Search,
  CheckCircle2 
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import MetricCard from '../../../components/ui/MetricCard';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import EmptyState from '../../../components/ui/EmptyState';
import ReportNavigationHeader from '../../../components/reports/ReportNavigationHeader';
import BarChartVisualizer from '../../../components/charts/BarChartVisualizer';
import DonutBreakdown from '../../../components/charts/DonutBreakdown';
import { reportService } from '../../../services/reports/reportService';
import { exportToCSV } from '../../../services/reports/exportService';

export const StudentReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('all');

  const [baseData, setBaseData] = useState({
    students: [],
    routes: [],
    buses: [],
  });

  const loadData = async (isSilent = false) => {
    if (isSilent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await reportService.fetchAllBaseData();
      setBaseData(data);
    } catch (err) {
      console.error('Failed to load student reports data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const studentAnalytics = reportService.computeStudentAnalytics(
    baseData.students,
    baseData.routes,
    baseData.buses
  );

  // Grade breakdown bar data
  const gradeBars = Object.entries(studentAnalytics.byGrade).map(([grade, count]) => ({
    label: grade,
    value: count,
    color: 'teal',
  }));

  // Route ridership donut data
  const routeDonutData = Object.entries(studentAnalytics.byRoute).slice(0, 5).map(([route, count], idx) => {
    const colors = ['#2563eb', '#0d9488', '#059669', '#d97706', '#64748b'];
    return {
      label: route.length > 15 ? route.slice(0, 12) + '...' : route,
      value: count,
      color: colors[idx % colors.length],
    };
  });

  // Filter students table (privacy compliant: no addresses, phone numbers or medical notes)
  const filteredStudents = studentAnalytics.studentsList.filter((s) => {
    if (gradeFilter !== 'all') {
      if ((s.grade || 'unassigned').toLowerCase() !== gradeFilter.toLowerCase()) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name = (s.fullName || `${s.firstName || ''} ${s.lastName || ''}`).toLowerCase();
      const sId = (s.id || '').toLowerCase();
      const rName = (s.routeName || '').toLowerCase();
      if (!name.includes(q) && !sId.includes(q) && !rName.includes(q)) return false;
    }
    return true;
  });

  // Export CSV (strictly privacy compliant)
  const handleExportCSV = () => {
    const headers = ['Student ID', 'Student Name', 'Grade', 'Route Assigned', 'Pickup Stop', 'Drop-off Stop'];
    const rows = filteredStudents.map((s) => [
      s.id || '',
      s.fullName || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student',
      s.grade || 'General',
      s.routeName || s.routeId || 'Assigned Corridor',
      s.pickupStop || 'Designated Stop',
      s.dropoffStop || 'School Entrance',
    ]);

    exportToCSV(headers, rows, `routewise-student-enrollment-${new Date().toISOString().split('T')[0]}.csv`);
  };

  return (
    <DashboardLayout title="Student Transport Enrollment & Passenger Distribution">
      <div className="space-y-6">
        <ReportNavigationHeader
          title="Student Transport Enrollment & Demographics Analytics"
          subtitle="Aggregate passenger distribution by academic grade, assigned corridor, and pickup density."
        >
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={() => loadData(true)}
            loading={refreshing}
          >
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={Download}
            onClick={handleExportCSV}
            className="bg-brand-navy hover:bg-slate-800 text-white font-bold"
          >
            Export Students CSV
          </Button>
        </ReportNavigationHeader>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Registered Passengers"
            value={studentAnalytics.totalStudents}
            icon={Users}
            subtitle="Enrolled in transport system"
            color="navy"
            loading={loading}
          />
          <MetricCard
            title="Assigned to Corridors"
            value={studentAnalytics.studentsList.filter(s => s.routeId || s.routeName).length}
            icon={Route}
            subtitle={`${studentAnalytics.totalStudents > 0 ? Math.round((studentAnalytics.studentsList.filter(s => s.routeId).length / studentAnalytics.totalStudents) * 100) : 0}% assignment rate`}
            color="teal"
            loading={loading}
          />
          <MetricCard
            title="Bus Assigned"
            value={studentAnalytics.studentsList.filter(s => s.busId).length}
            icon={Bus}
            subtitle="Vehicle seat allocation"
            color="blue"
            loading={loading}
          />
          <MetricCard
            title="Total Grade Levels"
            value={Object.keys(studentAnalytics.byGrade).length}
            icon={GraduationCap}
            subtitle="Academic classes served"
            color="emerald"
            loading={loading}
          />
        </div>

        {/* Two Visual Breakdown Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Grade Distribution Bar */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-teal" />
              Transport Enrollment by Grade Level
            </h3>
            <p className="text-xs text-brand-slate">
              Distribution of enrolled bus riders across school grades.
            </p>
            <BarChartVisualizer
              data={gradeBars}
              height={180}
              emptyText="No grade enrollment data recorded"
            />
          </Card>

          {/* Route Distribution Donut */}
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-brand-navy flex items-center gap-2">
              <Route className="w-4 h-4 text-brand-blue" />
              Passenger Ridership by Major Corridors
            </h3>
            <p className="text-xs text-brand-slate">
              Top assigned routes serving the student community.
            </p>
            <DonutBreakdown
              data={routeDonutData}
              centerValue={studentAnalytics.totalStudents}
              centerLabel="Riders"
              emptyText="No route assignment data available"
            />
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student name or route..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border text-brand-navy outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="font-bold text-brand-slate">Grade:</span>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border bg-white text-brand-navy outline-none focus:ring-2 focus:ring-brand-blue/30"
            >
              <option value="all">All Grades</option>
              {Object.keys(studentAnalytics.byGrade).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Privacy-Compliant Student Passenger Roster */}
        <div className="bg-white rounded-3xl border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h3 className="text-sm font-bold text-brand-navy">Student Passenger Enrollment Log</h3>
            <span className="text-xs font-semibold text-brand-slate">
              Showing {filteredStudents.length} students
            </span>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={Users}
                title="No students match criteria"
                description="Adjust search query or grade dropdown."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-brand-navy">
                <thead className="bg-slate-50 border-b border-border text-[10px] uppercase font-bold text-brand-slate tracking-wider">
                  <tr>
                    <th className="px-5 py-3">Student Name</th>
                    <th className="px-5 py-3">Student ID</th>
                    <th className="px-5 py-3">Grade</th>
                    <th className="px-5 py-3">Assigned Route</th>
                    <th className="px-5 py-3">Pickup Stop</th>
                    <th className="px-5 py-3">Drop-off Stop</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3 font-bold text-brand-navy">
                        {s.fullName || `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Student'}
                      </td>
                      <td className="px-5 py-3 font-medium text-brand-slate">
                        {s.id}
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="neutral" size="sm">
                          {s.grade || 'Primary'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 font-semibold text-brand-navy">
                        {s.routeName || s.routeId || 'Unassigned'}
                      </td>
                      <td className="px-5 py-3 text-brand-slate">
                        {s.pickupStop || 'Scheduled Station'}
                      </td>
                      <td className="px-5 py-3 text-brand-slate">
                        {s.dropoffStop || 'School Entrance'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentReportsPage;
