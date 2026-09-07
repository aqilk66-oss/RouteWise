import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Phone, 
  ArrowLeft, 
  CheckCircle2, 
  Send 
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

export const DriverEmergencyPage = () => {
  const { user } = useAuth();
  const { activeTrip, assignedBus, assignedRoute, driverProfile } = useDriverTransport();
  const [toastMessage, setToastMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleTriggerSos = async ({ reason, trip, bus, route }) => {
    try {
      const loc = trip?.lastLocation || null;
      await incidentService.createIncident({
        type: INCIDENT_TYPES.EMERGENCY,
        severity: INCIDENT_SEVERITY.CRITICAL,
        description: `DRIVER DIRECT EMERGENCY: ${reason}`,
        trip,
        bus,
        route,
        driver: driverProfile,
        location: loc,
        reportedBy: user,
      });
      setToastMessage('EMERGENCY DISTRESS SIGNAL TRANSMITTED. Dispatch responding.');
      setTimeout(() => setToastMessage(null), 8000);
    } catch (err) {
      setErrorMessage(`Emergency trigger error: ${err.message}. If in immediate physical danger, dial 911 directly.`);
    }
  };

  return (
    <DashboardLayout title="Driver Emergency Operations Center">
      <div className="space-y-6">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/driver/safety"
            className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Safety Center</span>
          </Link>
          <Badge variant="warning" size="md" className="uppercase font-mono">
            Emergency Standby
          </Badge>
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

        {/* SOS Button Component */}
        <DriverSosButton
          activeTrip={activeTrip}
          assignedBus={assignedBus}
          assignedRoute={assignedRoute}
          onTriggerSos={handleTriggerSos}
        />

        {/* Direct Emergency Telephone Hotlines */}
        <Card className="p-6 md:p-8 space-y-5">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <Phone className="w-5 h-5 text-rose-600" />
            <div>
              <h2 className="text-sm font-bold text-brand-navy">Emergency Direct Telephone Call</h2>
              <p className="text-[11px] text-brand-slate">Tap to place an immediate voice call to official responders.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Police / Medical / Fire</span>
                <h3 className="text-base font-black text-rose-900 mt-1">Official Emergency Services (911)</h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  For immediate threat to life, serious medical emergency, or severe traffic collision.
                </p>
              </div>

              <a
                href="tel:911"
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-soft"
              >
                <Phone className="w-4 h-4" />
                <span>Call 911 Now</span>
              </a>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">Internal Dispatch</span>
                <h3 className="text-base font-black text-brand-navy mt-1">School Transport Operations Desk</h3>
                <p className="text-xs text-brand-slate mt-0.5">
                  For vehicle breakdown, minor collision, road hazard, or route detour guidance.
                </p>
              </div>

              <a
                href="tel:+15550194820"
                className="w-full py-3 px-4 rounded-xl bg-brand-navy hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-soft"
              >
                <Phone className="w-4 h-4" />
                <span>Call Dispatch (+1 555-019-4820)</span>
              </a>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DriverEmergencyPage;
