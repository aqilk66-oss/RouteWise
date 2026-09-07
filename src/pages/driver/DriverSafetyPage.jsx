import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Phone, 
  AlertTriangle, 
  Navigation, 
  Bus, 
  Route as RouteIcon, 
  FileText, 
  Clock, 
  CheckCircle2, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import DriverSosButton from '../../components/safety/DriverSosButton';
import { useDriverTransport } from '../../context/DriverTransportContext';
import { useAuth } from '../../context/AuthContext';
import incidentService from '../../services/safety/incidentService';
import { INCIDENT_TYPES, INCIDENT_SEVERITY, EMERGENCY_DISCLAIMER } from '../../constants/incidentConstants';

export const DriverSafetyPage = () => {
  const { user } = useAuth();
  const { activeTrip, assignedBus, assignedRoute, driverProfile } = useDriverTransport();
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchContacts = async () => {
      const contacts = await incidentService.getEmergencyContacts();
      setEmergencyContacts(contacts);
    };
    fetchContacts();
  }, []);

  const handleTriggerSos = async ({ reason, trip, bus, route }) => {
    try {
      // Pull latest known GPS position from active trip if available
      const loc = trip?.lastLocation || null;
      await incidentService.createIncident({
        type: INCIDENT_TYPES.EMERGENCY,
        severity: INCIDENT_SEVERITY.CRITICAL,
        description: `DRIVER SOS BROADCAST: ${reason}`,
        trip,
        bus,
        route,
        driver: driverProfile,
        location: loc,
        reportedBy: user,
      });
      setToastMessage('EMERGENCY SOS TRANSMITTED. Dispatch operations have been notified.');
      setTimeout(() => setToastMessage(null), 8000);
    } catch (err) {
      setErrorMessage(`SOS Transmission error: ${err.message}. If in immediate physical danger, dial 911 directly.`);
    }
  };

  return (
    <DashboardLayout title="Driver Safety & Emergency Operations">
      <div className="space-y-6">
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

        {/* Prominent SOS Emergency Component */}
        <DriverSosButton
          activeTrip={activeTrip}
          assignedBus={assignedBus}
          assignedRoute={assignedRoute}
          onTriggerSos={handleTriggerSos}
        />

        {/* Active Transit Safety Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-slate">Transit Status</span>
              <Badge variant={activeTrip ? 'active' : 'neutral'} size="sm">
                {activeTrip ? 'Trip In Progress' : 'Depot Standby'}
              </Badge>
            </div>
            <p className="text-base font-bold text-brand-navy">
              {activeTrip?.routeName || assignedRoute?.name || 'No Active Transit Run'}
            </p>
            <p className="text-[11px] text-brand-slate">
              Bus ID: <strong className="text-brand-navy">{assignedBus?.busNumber || 'Assigned Bus'}</strong> • Driver: <strong className="text-brand-navy">{driverProfile?.fullName || user?.displayName || 'Operator'}</strong>
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-slate">Incident Reports</span>
              <Link to="/driver/incidents" className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1">
                <span>View Log</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <p className="text-base font-bold text-brand-navy">File Non-Emergency Incident</p>
            <p className="text-[11px] text-brand-slate">
              Report vehicle faults, medical issues, road hazards, or severe traffic blocks.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-slate">Safety Protocol</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-base font-bold text-brand-navy">Pre-Trip Safety Inspection</p>
            <p className="text-[11px] text-brand-slate">
              Check emergency doors, tire pressure, and first-aid kits prior to passenger boarding.
            </p>
          </Card>
        </div>

        {/* Authorized Emergency Contacts */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Phone className="w-5 h-5 text-brand-blue" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Operational Emergency Contacts</h2>
              <p className="text-[11px] text-brand-slate">Click-to-call direct dial telephone links for immediate response.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyContacts.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-slate block">
                    {c.type}
                  </span>
                  <h3 className="text-xs font-bold text-brand-navy mt-0.5">{c.name}</h3>
                  <p className="text-[11px] text-slate-500">{c.role}</p>
                </div>

                <a
                  href={`tel:${c.phone}`}
                  className="w-full py-2 px-3 rounded-xl bg-white border border-slate-300 hover:border-brand-blue hover:text-brand-blue text-xs font-bold text-brand-navy flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-blue" />
                  <span>{c.phone}</span>
                </a>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-amber-800 leading-relaxed">
            <strong>Emergency Procedure Notice:</strong> In the event of a road collision, ensure the bus is parked safely with hazard lights activated. Check all student passengers for injuries, keep students calm inside the vehicle unless evacuation is required, and notify dispatch immediately.
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DriverSafetyPage;
