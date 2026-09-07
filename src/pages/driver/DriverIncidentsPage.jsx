import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Send, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowLeft,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useDriverTransport } from '../../context/DriverTransportContext';
import { useAuth } from '../../context/AuthContext';
import incidentService from '../../services/safety/incidentService';
import { 
  INCIDENT_TYPES, 
  INCIDENT_TYPE_LABELS, 
  INCIDENT_SEVERITY, 
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS,
  INCIDENT_STATUS_LABELS,
  INCIDENT_SOURCES 
} from '../../constants/incidentConstants';

export const DriverIncidentsPage = () => {
  const { user } = useAuth();
  const { activeTrip, assignedBus, assignedRoute, driverProfile } = useDriverTransport();

  const [incidentsList, setIncidentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Report Form State
  const [formData, setFormData] = useState({
    type: INCIDENT_TYPES.VEHICLE_ISSUE,
    severity: INCIDENT_SEVERITY.MEDIUM,
    description: '',
  });

  const loadDriverIncidents = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getIncidents({
        driverId: user?.uid,
        limitCount: 30,
      });
      setIncidentsList(data);
    } catch (err) {
      console.warn('Load driver incidents notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDriverIncidents();
  }, [user?.uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      setErrorMessage('Please provide a brief description of the incident.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const loc = activeTrip?.lastLocation || null;
      await incidentService.createIncident({
        type: formData.type,
        severity: formData.severity,
        description: formData.description.trim(),
        trip: activeTrip,
        bus: assignedBus,
        route: assignedRoute,
        driver: driverProfile,
        location: loc,
        source: INCIDENT_SOURCES.DRIVER,
        reportedBy: user,
      });

      setToastMessage('Incident report recorded and logged for administrative investigation.');
      setFormData({
        type: INCIDENT_TYPES.VEHICLE_ISSUE,
        severity: INCIDENT_SEVERITY.MEDIUM,
        description: '',
      });
      await loadDriverIncidents();
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'We could not submit the report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityBadgeVariant = (severity) => {
    switch (severity) {
      case INCIDENT_SEVERITY.CRITICAL: return 'danger';
      case INCIDENT_SEVERITY.HIGH: return 'warning';
      case INCIDENT_SEVERITY.MEDIUM: return 'info';
      default: return 'neutral';
    }
  };

  return (
    <DashboardLayout title="Driver Transport Incident Reporting">
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/driver/safety"
            className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Safety Operations</span>
          </Link>
          <Link to="/driver/emergency">
            <Button variant="outline" size="sm" className="text-rose-600 border-rose-200 hover:bg-rose-50 font-bold">
              Immediate SOS Screen
            </Button>
          </Link>
        </div>

        {/* Toast / Error Banner */}
        {toastMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in shadow-soft">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 font-bold text-xs rounded-2xl flex items-center gap-2.5 animate-fade-in shadow-soft">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Column */}
          <div className="lg:col-span-6">
            <Card className="p-6 md:p-8 space-y-5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <FileText className="w-5 h-5 text-brand-blue" />
                <div>
                  <h2 className="text-sm font-bold text-brand-navy">File Operational Incident Report</h2>
                  <p className="text-[11px] text-brand-slate">Submit records for vehicle issues, hazards, passenger health, or delays.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-brand-navy mb-1.5">
                    Incident Classification <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white font-medium focus:ring-2 focus:ring-brand-blue/30 outline-none"
                  >
                    <option value={INCIDENT_TYPES.VEHICLE_ISSUE}>{INCIDENT_TYPE_LABELS[INCIDENT_TYPES.VEHICLE_ISSUE]}</option>
                    <option value={INCIDENT_TYPES.ROAD_HAZARD}>{INCIDENT_TYPE_LABELS[INCIDENT_TYPES.ROAD_HAZARD]}</option>
                    <option value={INCIDENT_TYPES.MEDICAL}>{INCIDENT_TYPE_LABELS[INCIDENT_TYPES.MEDICAL]}</option>
                    <option value={INCIDENT_TYPES.SECURITY}>{INCIDENT_TYPE_LABELS[INCIDENT_TYPES.SECURITY]}</option>
                    <option value={INCIDENT_TYPES.ACCIDENT}>{INCIDENT_TYPE_LABELS[INCIDENT_TYPES.ACCIDENT]}</option>
                    <option value={INCIDENT_TYPES.DELAY}>{INCIDENT_TYPE_LABELS[INCIDENT_TYPES.DELAY]}</option>
                    <option value={INCIDENT_TYPES.OTHER}>{INCIDENT_TYPE_LABELS[INCIDENT_TYPES.OTHER]}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-brand-navy mb-1.5">
                    Assessed Severity Level
                  </label>
                  <select
                    value={formData.severity}
                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-white font-medium focus:ring-2 focus:ring-brand-blue/30 outline-none"
                  >
                    <option value={INCIDENT_SEVERITY.LOW}>Low — Minor fault / Informational</option>
                    <option value={INCIDENT_SEVERITY.MEDIUM}>Medium — Schedule impact / Requires inspection</option>
                    <option value={INCIDENT_SEVERITY.HIGH}>High — Urgent attention required</option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-brand-navy">
                      Factual Description <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-brand-slate">{formData.description.length}/500 chars</span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    maxLength={500}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what occurred, vehicle condition, or road block details..."
                    className="w-full p-3 rounded-xl border border-border font-medium focus:ring-2 focus:ring-brand-blue/30 outline-none resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 space-y-1">
                  <p>Trip: <strong>{activeTrip?.routeName || 'None active'}</strong></p>
                  <p>Bus: <strong>{assignedBus?.busNumber || 'Assigned'}</strong> • Driver: <strong>{driverProfile?.fullName || user?.displayName}</strong></p>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  icon={Send}
                  loading={submitting}
                  className="w-full bg-brand-navy hover:bg-slate-800 text-white font-bold py-3 shadow-soft"
                >
                  Submit Incident Report
                </Button>
              </form>
            </Card>
          </div>

          {/* History Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-sm font-bold text-brand-navy">Your Incident Filing History</h3>
              <Badge variant="neutral" size="sm">{incidentsList.length} Recorded</Badge>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-white border border-border rounded-2xl animate-pulse p-4" />
                ))}
              </div>
            ) : incidentsList.length === 0 ? (
              <Card className="p-8 text-center text-xs text-brand-slate space-y-2">
                <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-brand-navy">No Incident Records Found</p>
                <p className="text-[11px]">You have not reported any safety or vehicle issues recently.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {incidentsList.map((inc) => (
                  <Card key={inc.id} className="p-5 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-brand-navy text-[11px]">{inc.incidentId || inc.id}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={getSeverityBadgeVariant(inc.severity)} size="sm">
                          {INCIDENT_SEVERITY_LABELS[inc.severity] || inc.severity}
                        </Badge>
                        <Badge variant={inc.status === INCIDENT_STATUS.RESOLVED ? 'active' : 'warning'} size="sm">
                          {INCIDENT_STATUS_LABELS[inc.status] || inc.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="font-bold text-brand-navy">{INCIDENT_TYPE_LABELS[inc.type] || inc.type}</p>
                    <p className="text-brand-slate text-[11px] leading-relaxed">{inc.description}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>Bus: {inc.busNumber} • Route: {inc.routeName}</span>
                      <span>{inc.createdAt ? new Date(inc.createdAt?.seconds ? inc.createdAt.seconds * 1000 : inc.createdAt).toLocaleDateString() : 'Recent'}</span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverIncidentsPage;
