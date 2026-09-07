import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Baby, 
  Clock, 
  MapPin, 
  Navigation,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useParentTransport } from '../../context/ParentTransportContext';
import incidentService from '../../services/safety/incidentService';
import { EMERGENCY_DISCLAIMER } from '../../constants/incidentConstants';

export const ParentSafetyPage = () => {
  const { childrenList } = useParentTransport();
  const [contacts, setContacts] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSafetyInfo = async () => {
      try {
        setLoading(true);
        const [contactList, recentIncidents] = await Promise.all([
          incidentService.getEmergencyContacts(),
          incidentService.getIncidents({ limitCount: 20 }),
        ]);

        setContacts(contactList);

        // Filter alerts relevant to parent's children routes/buses
        const childBusIds = new Set(childrenList.map(c => c.busId).filter(Boolean));
        const childRouteIds = new Set(childrenList.map(c => c.routeId).filter(Boolean));

        const relevant = recentIncidents.filter(
          i => (i.busId && childBusIds.has(i.busId)) || (i.routeId && childRouteIds.has(i.routeId))
        );
        setActiveAlerts(relevant);
      } catch (err) {
        console.warn('Parent safety info notice:', err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSafetyInfo();
  }, [childrenList]);

  return (
    <DashboardLayout title="Student Transit Safety & Guardian Assistance">
      <div className="space-y-6">
        {/* Safety Header */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-teal bg-teal-50 px-2.5 py-0.5 rounded-md border border-teal-200">
                Guardian Safety Portal
              </span>
            </div>
            <h1 className="text-xl font-bold text-brand-navy tracking-tight mt-1">
              Family Transit Safety Center
            </h1>
            <p className="text-xs text-brand-slate mt-0.5">
              Verified transit safety updates, emergency protocol guidelines, and direct school assistance.
            </p>
          </div>

          <Link to="/parent/tracking">
            <Button variant="primary" size="sm" icon={Navigation} className="bg-brand-navy font-bold">
              Live Bus Tracking
            </Button>
          </Link>
        </div>

        {/* Active Child Safety Alert (if any) */}
        {activeAlerts.length > 0 ? (
          <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-400 text-amber-950 space-y-2 animate-fade-in shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <span>Active Safety Notice on Your Child's Transport Route</span>
              </div>
              <Badge variant="warning" size="sm">Notice Active</Badge>
            </div>
            {activeAlerts.map(alert => (
              <div key={alert.id} className="p-3 bg-white/80 rounded-2xl text-xs space-y-1">
                <p className="font-bold text-brand-navy">{alert.type?.toUpperCase()} — Bus {alert.busNumber}</p>
                <p className="text-brand-slate">{alert.description}</p>
                <p className="text-[10px] text-slate-400">Status: {alert.status} • Updated recently</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5 text-xs text-emerald-900 shadow-soft">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">All Assigned Student Transit Corridors are Normal</p>
              <p className="text-emerald-700 text-[11px] mt-0.5">
                No safety delays, mechanical faults, or emergency alerts are currently reported for your enrolled children.
              </p>
            </div>
          </div>
        )}

        {/* Transport Safety Procedures & Direct Contacts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Procedures */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6 md:p-8 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Info className="w-5 h-5 text-brand-blue" />
                <h2 className="text-sm font-bold text-brand-navy">What to do in a Transportation Emergency</h2>
              </div>

              <div className="space-y-3 text-xs text-brand-slate leading-relaxed">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-brand-navy text-xs mb-1">1. Stay in the RouteWise App</h3>
                  <p className="text-[11px]">
                    Dispatch constantly updates live location and vehicle status. Verified transit advisories appear directly on your dashboard.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-brand-navy text-xs mb-1">2. Direct Contact with Dispatch</h3>
                  <p className="text-[11px]">
                    If a bus is significantly delayed beyond the automated alert window, call the District Transport Office using the direct link below.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="font-bold text-brand-navy text-xs mb-1">3. Safe Pickup Points</h3>
                  <p className="text-[11px]">
                    In rare route detours or vehicle replacements, drivers maintain authorized stops. Do not attempt to intercept vehicles in active traffic.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Direct Assistance Contacts */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Phone className="w-5 h-5 text-brand-teal" />
                <h3 className="text-sm font-bold text-brand-navy">Direct School Helplines</h3>
              </div>

              <div className="space-y-3">
                {contacts.filter(c => c.type !== 'Security').map(c => (
                  <div key={c.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-brand-navy block">{c.name}</span>
                      <span className="text-[10px] text-brand-slate">{c.role}</span>
                    </div>
                    <a
                      href={`tel:${c.phone}`}
                      className="py-1.5 px-3 rounded-xl bg-white border border-slate-300 font-bold font-mono text-xs text-brand-blue hover:bg-brand-blue hover:text-white transition-colors"
                    >
                      Call
                    </a>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-500 leading-relaxed border border-slate-200">
                {EMERGENCY_DISCLAIMER}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentSafetyPage;
