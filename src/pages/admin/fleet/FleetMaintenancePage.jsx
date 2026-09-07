import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Filter,
  DollarSign
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import FleetNavHeader from '../../../components/fleet/FleetNavHeader';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import { maintenanceService, busService } from '../../../services/firestore';
import { auditService } from '../../../services/admin/auditService';
import { useAuth } from '../../../context/AuthContext';
import { MAINTENANCE_STATUS, MAINTENANCE_PRIORITY, BUS_STATUS } from '../../../constants/collections';

export const FleetMaintenancePage = () => {
  const { role, user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [buses, setBuses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    busId: '',
    title: '',
    type: 'routine service',
    priority: MAINTENANCE_PRIORITY.MEDIUM,
    status: MAINTENANCE_STATUS.SCHEDULED,
    scheduledAt: new Date().toISOString().split('T')[0],
    vendor: 'District Fleet Workshop',
    cost: '',
    notes: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mntList, busList] = await Promise.all([
        maintenanceService.getAll({ max: 200 }),
        busService.getAll({ max: 200 }),
      ]);
      setRecords(mntList || []);
      setBuses(busList || []);
    } catch (err) {
      console.error('Failed to load maintenance records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.busId || !formData.title.trim()) return;

    try {
      const created = await maintenanceService.createRecord(formData);
      await auditService.logEvent({
        actorUserId: user?.uid,
        actorName: profile?.fullName || user?.email,
        actorRole: role,
        action: 'MAINTENANCE_ORDER_CREATED',
        resourceType: 'maintenanceRecord',
        resourceId: created.id || created.maintenanceId,
        description: `Logged maintenance work order for bus ${formData.busId}: ${formData.title}.`,
        severity: 'info',
        metadata: formData,
      });

      setIsModalOpen(false);
      setToastMessage({ type: 'success', text: 'Work order scheduled successfully.' });
      fetchData();
    } catch (err) {
      setToastMessage({ type: 'error', text: err.message || 'Failed to create work order.' });
    }
  };

  const handleComplete = async (record) => {
    try {
      await maintenanceService.completeRecord(record.id || record.maintenanceId, record.busId);
      await auditService.logEvent({
        actorUserId: user?.uid,
        actorName: profile?.fullName || user?.email,
        actorRole: role,
        action: 'MAINTENANCE_ORDER_COMPLETED',
        resourceType: 'maintenanceRecord',
        resourceId: record.id || record.maintenanceId,
        description: `Completed maintenance order for bus ${record.busId}. Vehicle restored to operational pool.`,
        severity: 'info',
      });
      setToastMessage({ type: 'success', text: 'Work order completed and vehicle restored.' });
      fetchData();
    } catch (err) {
      setToastMessage({ type: 'error', text: 'Failed to complete record.' });
    }
  };

  const filteredRecords = records.filter((r) => {
    if (filterStatus === 'all') return true;
    return r.status === filterStatus;
  });

  return (
    <DashboardLayout>
      <FleetNavHeader 
        title="Fleet Maintenance & Service Management" 
        subtitle="Manage routine servicing, mechanical repairs, work orders, and vehicle shop downtime."
      >
        <Button variant="primary" icon={Plus} size="sm" onClick={() => setIsModalOpen(true)}>
          New Work Order
        </Button>
      </FleetNavHeader>

      {toastMessage && (
        <div className={`p-4 mb-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-soft ${
          toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
          'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="p-4 bg-white border border-border rounded-2xl shadow-soft mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-brand-navy">Filter Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-brand-navy bg-white focus:outline-none focus:border-brand-teal"
          >
            <option value="all">All Work Orders</option>
            <option value={MAINTENANCE_STATUS.SCHEDULED}>Scheduled</option>
            <option value={MAINTENANCE_STATUS.IN_PROGRESS}>In Progress</option>
            <option value={MAINTENANCE_STATUS.COMPLETED}>Completed</option>
          </select>
        </div>

        <span className="text-xs text-brand-slate font-semibold">
          Showing <strong>{filteredRecords.length}</strong> of {records.length} records
        </span>
      </div>

      {/* Maintenance Table */}
      <div className="bg-white border border-border rounded-3xl shadow-soft overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-brand-navy">No maintenance orders found</p>
            <p className="text-xs text-brand-slate mt-1 mb-4">Create a service work order to track bus maintenance and repairs.</p>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsModalOpen(true)}>
              Create First Work Order
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Work Order</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Scheduled Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecords.map((rec) => {
                  const busObj = buses.find((b) => b.busId === rec.busId || b.id === rec.busId);

                  return (
                    <tr key={rec.id || rec.maintenanceId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-brand-navy">
                        {busObj ? `Bus ${busObj.busNumber}` : rec.busId}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-brand-navy">{rec.title}</div>
                        <span className="text-[11px] text-slate-500">{rec.vendor || 'Internal Shop'}</span>
                      </td>
                      <td className="py-3.5 px-4 uppercase text-[11px] font-semibold text-slate-600">
                        {rec.type}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={
                          rec.priority === 'critical' ? 'danger' :
                          rec.priority === 'high' ? 'warning' : 'neutral'
                        }>
                          {rec.priority}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {rec.scheduledAt?.split('T')[0] || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={
                          rec.status === 'completed' ? 'success' :
                          rec.status === 'inProgress' ? 'warning' : 'neutral'
                        }>
                          {rec.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {rec.status !== 'completed' && (
                          <button
                            onClick={() => handleComplete(rec)}
                            className="px-2.5 py-1 rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                          >
                            Mark Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Work Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Maintenance Work Order"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-brand-navy block mb-1">Target Vehicle *</label>
            <select
              required
              value={formData.busId}
              onChange={(e) => setFormData({ ...formData, busId: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
            >
              <option value="">Select bus</option>
              {buses.map((b) => (
                <option key={b.id || b.busId} value={b.busId || b.id}>
                  {b.busNumber} ({b.registrationNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-brand-navy block mb-1">Service Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Brake Replacement & Rotor Turning"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-navy block mb-1">Service Category</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="routine service">Routine Service</option>
                <option value="brake inspection">Brake Inspection</option>
                <option value="tire service">Tire Service</option>
                <option value="engine">Engine / Transmission</option>
                <option value="electrical">Electrical / Lights</option>
                <option value="safety equipment">Safety Equipment</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-brand-navy block mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-brand-teal"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical (Safety Stop)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-brand-navy block mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={formData.scheduledAt}
                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="font-bold text-brand-navy block mb-1">Vendor / Service Shop</label>
              <input
                type="text"
                placeholder="District Fleet Center"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-teal"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Work Order
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default FleetMaintenancePage;
