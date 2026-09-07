import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Route, 
  ChevronLeft, 
  Save, 
  Building2, 
  Clock, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Button from '../../../components/ui/Button';
import { routeService, busService, driverService } from '../../../services/firestore';
import { auditService } from '../../../services/admin/auditService';
import { useAuth } from '../../../context/AuthContext';
import { ROUTE_STATUS, USER_ROLES } from '../../../constants/collections';

export const RouteCreatePage = () => {
  const navigate = useNavigate();
  const { role, user, profile } = useAuth();
  const isTransport = role === USER_ROLES.TRANSPORT_MANAGER;
  const basePrefix = isTransport ? '/transport/planning' : '/admin/planning';

  const [saving, setSaving] = useState(false);
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    routeCode: '',
    name: '',
    description: '',
    schoolId: 'main-campus',
    assignedBusId: '',
    assignedDriverId: '',
    estimatedDuration: '45 mins',
    distance: '12.4 miles',
    status: ROUTE_STATUS.DRAFT,
  });

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const [busList, driverList] = await Promise.all([
          busService.getAll({ max: 100 }),
          driverService.getAll({ max: 100 }),
        ]);
        setBuses(busList || []);
        setDrivers(driverList || []);
      } catch (err) {
        console.error('Failed to load fleet for route create:', err);
      }
    };
    fetchEntities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name?.trim() || !formData.routeCode?.trim()) {
      setError('Route name and unique route code are mandatory.');
      return;
    }

    try {
      setSaving(true);
      const created = await routeService.createRoute({
        ...formData,
        routeCode: formData.routeCode.trim().toUpperCase(),
        name: formData.name.trim(),
        stopIds: [],
      });

      // Audit Log
      await auditService.logEvent({
        actorUserId: user?.uid,
        actorName: profile?.fullName || user?.email,
        actorRole: role,
        action: 'ROUTE_CREATED',
        resourceType: 'route',
        resourceId: created.id || created.routeId,
        description: `Created new draft route ${formData.name} (${formData.routeCode}).`,
        severity: 'info',
        metadata: formData,
      });

      // Navigate to detail view to begin stop sequencing
      navigate(`${basePrefix}/routes/${created.id || created.routeId}`);
    } catch (err) {
      setError(err.message || 'Failed to create route.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link to={`${basePrefix}/routes`}>
            <button className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
              <ChevronLeft className="w-4 h-4 text-brand-navy" />
            </button>
          </Link>
          <div>
            <h2 className="text-2xl font-black text-brand-navy">Create Transit Route</h2>
            <p className="text-xs text-brand-slate">Define corridor metadata and assign initial fleet assets.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="p-6 bg-white border border-border rounded-3xl shadow-soft space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-navy block mb-1">Route Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Northwood Elementary Corridor"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brand-navy block mb-1">Route Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. RW-101"
                value={formData.routeCode}
                onChange={(e) => setFormData({ ...formData, routeCode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy uppercase focus:outline-none focus:border-brand-blue"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-brand-navy block mb-1">Description / Corridor Notes</label>
            <textarea
              rows={3}
              placeholder="Provide context regarding neighborhood transit zones, highway segments, or drop-off schedules."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-brand-navy block mb-1">School Campus</label>
              <input
                type="text"
                value={formData.schoolId}
                onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy focus:outline-none focus:border-brand-blue"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-brand-navy block mb-1">Assigned Vehicle</label>
              <select
                value={formData.assignedBusId}
                onChange={(e) => setFormData({ ...formData, assignedBusId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy bg-white focus:outline-none focus:border-brand-blue"
              >
                <option value="">Select bus (optional)</option>
                {buses.map((b) => (
                  <option key={b.id || b.busId} value={b.busId || b.id}>
                    {b.busNumber} ({b.capacity} Seats)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-brand-navy block mb-1">Assigned Driver</label>
              <select
                value={formData.assignedDriverId}
                onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-brand-navy bg-white focus:outline-none focus:border-brand-blue"
              >
                <option value="">Select driver (optional)</option>
                {drivers.map((d) => (
                  <option key={d.id || d.driverId} value={d.driverId || d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link to={`${basePrefix}/routes`}>
              <Button variant="ghost" size="sm">
                Cancel
              </Button>
            </Link>
            <Button variant="primary" size="sm" type="submit" icon={Save} disabled={saving}>
              {saving ? 'Creating...' : 'Save & Configure Stops'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default RouteCreatePage;
