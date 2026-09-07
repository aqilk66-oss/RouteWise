import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Bus, 
  User, 
  Route as RouteIcon, 
  ArrowLeft,
  Send,
  Lock,
  Calendar,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../../layouts/DashboardLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import incidentService from '../../../services/safety/incidentService';
import { useAuth } from '../../../context/AuthContext';
import { 
  INCIDENT_TYPES, 
  INCIDENT_TYPE_LABELS, 
  INCIDENT_SEVERITY, 
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_STATUS, 
  INCIDENT_STATUS_LABELS,
  ALLOWED_STATUS_TRANSITIONS 
} from '../../../constants/incidentConstants';

export const AdminIncidentDetailPage = () => {
  const { incidentId } = useParams();
  const { user } = useAuth();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const loadIncident = async () => {
    try {
      setLoading(true);
      const data = await incidentService.getIncidentById(incidentId);
      setIncident(data);
    } catch (err) {
      setErrorMessage('Could not load incident details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  const handleTransition = async (newStatus) => {
    if (!incident) return;
    setActionLoading(true);
    setErrorMessage(null);

    try {
      await incidentService.updateIncidentStatus(incident.id, newStatus, {
        note: actionNote.trim(),
        user,
      });
      setToastMessage(`Incident status advanced to '${INCIDENT_STATUS_LABELS[newStatus] || newStatus}'.`);
      setActionNote('');
      await loadIncident();
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err) {
      setErrorMessage(err.message || 'Status transition failed.');
    } finally {
      setActionLoading(false);
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

  if (loading) {
    return (
      <DashboardLayout title="Incident Operational Details">
        <div className="p-8 text-center text-xs text-brand-slate animate-pulse">
          Loading incident telemetry and timeline...
        </div>
      </DashboardLayout>
    );
  }

  if (!incident) {
    return (
      <DashboardLayout title="Incident Not Found">
        <div className="p-12 text-center text-xs space-y-3">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-base font-bold text-brand-navy">Incident Record Not Found</h2>
          <p className="text-brand-slate">The requested incident ID does not exist or access is restricted.</p>
          <Link to="/admin/incidents">
            <Button variant="outline" size="sm">Return to Register</Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const allowedNext = ALLOWED_STATUS_TRANSITIONS[incident.status] || [];

  return (
    <DashboardLayout title={`Incident Manifest: ${incident.incidentId || incident.id}`}>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/incidents"
            className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Incident Register</span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant={getSeverityBadgeVariant(incident.severity)} size="md">
              {INCIDENT_SEVERITY_LABELS[incident.severity] || incident.severity}
            </Badge>
            <Badge variant={incident.status === INCIDENT_STATUS.RESOLVED ? 'active' : 'warning'} size="md">
              {INCIDENT_STATUS_LABELS[incident.status] || incident.status}
            </Badge>
          </div>
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
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Incident Summary Banner */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-slate uppercase">
                {incident.incidentId || incident.id}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-bold text-brand-blue">
                Source: {incident.source || 'Driver'}
              </span>
            </div>
            <h1 className="text-xl font-bold text-brand-navy">
              {INCIDENT_TYPE_LABELS[incident.type] || incident.type}
            </h1>
            <p className="text-xs text-brand-slate max-w-xl leading-relaxed">
              {incident.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Bus Vehicle</span>
              <strong className="text-brand-navy">{incident.busNumber}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Transit Route</span>
              <strong className="text-brand-navy">{incident.routeName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Driver</span>
              <strong className="text-brand-navy">{incident.driverName}</strong>
            </div>
          </div>
        </div>

        {/* Location & Response Action Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Response & Timeline Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Operational Action Panel */}
            <Card className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-brand-navy pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Operational Response Workflow</span>
                <span className="text-[11px] font-normal text-brand-slate">
                  Current Status: <strong className="text-brand-navy">{incident.status}</strong>
                </span>
              </h2>

              {allowedNext.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                  This incident is currently in a terminal state ({incident.status}). No further state progressions available.
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-brand-navy mb-1">
                      Response / Resolution Notes
                    </label>
                    <textarea
                      rows={2}
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                      placeholder="Add investigation findings, dispatch coordination, or resolution summary..."
                      className="w-full p-2.5 rounded-xl border border-border outline-none focus:ring-2 focus:ring-brand-blue/30 font-medium"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {allowedNext.includes(INCIDENT_STATUS.ACKNOWLEDGED) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTransition(INCIDENT_STATUS.ACKNOWLEDGED)}
                        loading={actionLoading}
                        className="font-bold border-blue-300 text-brand-blue hover:bg-blue-50"
                      >
                        Acknowledge Incident
                      </Button>
                    )}

                    {allowedNext.includes(INCIDENT_STATUS.INVESTIGATING) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTransition(INCIDENT_STATUS.INVESTIGATING)}
                        loading={actionLoading}
                        className="font-bold border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        Mark Investigating
                      </Button>
                    )}

                    {allowedNext.includes(INCIDENT_STATUS.RESPONDING) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTransition(INCIDENT_STATUS.RESPONDING)}
                        loading={actionLoading}
                        className="font-bold border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                      >
                        Dispatch Response
                      </Button>
                    )}

                    {allowedNext.includes(INCIDENT_STATUS.RESOLVED) && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleTransition(INCIDENT_STATUS.RESOLVED)}
                        loading={actionLoading}
                        className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        Resolve Incident
                      </Button>
                    )}

                    {allowedNext.includes(INCIDENT_STATUS.CLOSED) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTransition(INCIDENT_STATUS.CLOSED)}
                        loading={actionLoading}
                        className="font-bold border-slate-300 text-slate-700 hover:bg-slate-100"
                      >
                        Close Incident
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </Card>

            {/* Audit Timeline */}
            <Card className="p-6 space-y-4">
              <h2 className="text-sm font-bold text-brand-navy pb-2 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-blue" />
                <span>Incident Progression Timeline</span>
              </h2>

              <div className="space-y-4 text-xs">
                {(incident.timeline || []).map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-blue mt-1 shrink-0 ring-4 ring-blue-50" />
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-brand-navy uppercase text-[11px]">
                          {entry.status}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {entry.timestamp ? new Date(entry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'N/A'}
                        </span>
                      </div>
                      <p className="text-brand-slate text-[11px]">{entry.note}</p>
                      <span className="text-[10px] text-slate-400 block italic">By {entry.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Location & Vehicle Telemetry Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-brand-teal" />
                <h3 className="text-sm font-bold text-brand-navy">GPS Position Telemetry</h3>
              </div>

              {incident.location?.latitude && incident.location?.longitude ? (
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-900 text-white font-mono space-y-1">
                    <p className="text-[11px] text-brand-teal uppercase font-bold tracking-wider">Recorded Coordinates</p>
                    <p className="text-sm font-bold">{incident.location.latitude.toFixed(6)}, {incident.location.longitude.toFixed(6)}</p>
                    {incident.location.accuracy && (
                      <p className="text-[11px] text-slate-400">Accuracy: ±{Math.round(incident.location.accuracy)} meters</p>
                    )}
                  </div>

                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${incident.location.latitude},${incident.location.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-brand-navy font-bold text-xs transition-colors"
                  >
                    Open in External Map Viewer ↗
                  </a>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-brand-slate bg-slate-50 rounded-2xl border border-slate-200">
                  <MapPin className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-bold text-brand-navy">Current Location Unavailable</p>
                  <p className="text-[11px] mt-0.5">Device GPS was offline or not permitted at time of filing.</p>
                </div>
              )}
            </Card>

            {/* Reporter Metadata */}
            <Card className="p-6 space-y-3 text-xs">
              <h3 className="text-sm font-bold text-brand-navy pb-2 border-b border-slate-100">Reporter Information</h3>
              <p>Name: <strong className="text-brand-navy">{incident.reportedBy?.fullName || 'Transit Staff'}</strong></p>
              <p>Email: <span className="font-mono text-slate-600">{incident.reportedBy?.email || 'N/A'}</span></p>
              <p>Filing Source: <strong className="text-brand-blue uppercase">{incident.source || 'driver'}</strong></p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminIncidentDetailPage;
