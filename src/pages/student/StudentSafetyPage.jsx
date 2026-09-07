import React from 'react';
import { 
  ShieldCheck, 
  Bus, 
  MapPin, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useStudentTransport } from '../../context/StudentTransportContext';
import { EMERGENCY_DISCLAIMER } from '../../constants/incidentConstants';

export const StudentSafetyPage = () => {
  const { studentRecord, assignedBus, assignedRoute, pickupInfo } = useStudentTransport();

  return (
    <DashboardLayout title="Student Bus Rider Safety Guidelines">
      <div className="space-y-6">
        {/* Safety Header */}
        <div className="p-6 rounded-3xl bg-white border border-border shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                Rider Safety Rules
              </span>
            </div>
            <h1 className="text-xl font-bold text-brand-navy tracking-tight mt-1">
              Safe Riding on RouteWise
            </h1>
            <p className="text-xs text-brand-slate mt-0.5">
              Important guidelines and safety rules for boarding, riding, and exiting your school bus.
            </p>
          </div>

          <Link to="/student/transport">
            <Button variant="outline" size="sm" icon={Bus}>
              My Assigned Bus & Stop
            </Button>
          </Link>
        </div>

        {/* Safety State */}
        <div className="p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex items-center gap-3.5 text-xs text-emerald-900 shadow-soft">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <p className="font-bold text-sm">Your Transit Corridor is Safe</p>
            <p className="text-emerald-700 text-[11px] mt-0.5">
              No active weather advisories, schedule interruptions, or vehicle faults for {assignedRoute?.name || 'your bus route'}.
            </p>
          </div>
        </div>

        {/* Bus Rider Safety Rules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <Card className="p-6 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="text-sm font-bold text-brand-navy">At the Bus Stop</h3>
            <ul className="space-y-2 text-[11px] text-brand-slate list-disc pl-4 leading-relaxed">
              <li>Arrive at least 5 minutes before your scheduled pickup time.</li>
              <li>Wait on the sidewalk, at least 6 giant steps (10 feet) back from the curb.</li>
              <li>Never run into the street to chase a departing bus.</li>
            </ul>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="text-sm font-bold text-brand-navy">Boarding & Riding</h3>
            <ul className="space-y-2 text-[11px] text-brand-slate list-disc pl-4 leading-relaxed">
              <li>Wait until the bus comes to a complete stop and the driver opens the doors.</li>
              <li>Use the handrail when stepping on or off the bus.</li>
              <li>Find your seat quickly and remain seated with your seatbelt fastened while the bus is moving.</li>
            </ul>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="text-sm font-bold text-brand-navy">Exiting Safely</h3>
            <ul className="space-y-2 text-[11px] text-brand-slate list-disc pl-4 leading-relaxed">
              <li>Look both ways for cyclists or traffic before stepping out of the bus door.</li>
              <li>If crossing the street, walk 10 steps ahead of the bus and make eye contact with the driver before stepping forward.</li>
              <li>Never walk behind the school bus.</li>
            </ul>
          </Card>
        </div>

        {/* Assistance Notice */}
        <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-brand-slate flex items-start gap-3">
          <Info className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            If you ever feel unsafe or unwell while riding the bus, immediately inform your bus driver. The driver has direct communication with the school transportation office.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentSafetyPage;
