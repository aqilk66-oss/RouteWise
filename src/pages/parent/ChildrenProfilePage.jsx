import React from 'react';
import { 
  Users, 
  MapPin, 
  Bus, 
  Route as RouteIcon, 
  Clock, 
  ShieldCheck, 
  Baby, 
  RefreshCw 
} from 'lucide-react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useParentTransport } from '../../context/ParentTransportContext';

export const ChildrenProfilePage = () => {
  const { childrenList, loading, refreshData, refreshing } = useParentTransport();

  return (
    <DashboardLayout title="Registered Children & Student Transport Profiles">
      <div className="space-y-6">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-border shadow-soft">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Family Student Roster</h2>
            <p className="text-xs text-brand-slate mt-0.5">
              Verified student records linked to your guardian account for institutional transportation.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            onClick={refreshData}
            loading={refreshing}
          >
            Refresh Roster
          </Button>
        </div>

        {/* Children Grid */}
        {childrenList.length === 0 ? (
          <EmptyState
            icon={Baby}
            title="No children linked to this guardian account"
            description="Contact the school transportation office to register your student ID or verify your guardian authorization."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {childrenList.map((child) => (
              <Card key={child.id} className="p-6 space-y-5 hover:shadow-subtle transition-all">
                {/* Child Header Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-blue flex items-center justify-center font-bold text-base border border-blue-100">
                      {(child.firstName || 'S').charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-brand-navy leading-tight">
                        {child.fullName || `${child.firstName} ${child.lastName}`}
                      </h3>
                      <p className="text-xs text-brand-slate mt-0.5">
                        ID: <span className="font-semibold text-brand-navy">{child.studentId || child.id.substring(0, 8)}</span> • Grade: {child.grade || 'Primary'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="active" size="sm">Enrolled</Badge>
                </div>

                {/* Transportation Specifications */}
                <div className="space-y-3 pt-2 border-t border-border text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-border">
                    <span className="text-brand-slate font-medium flex items-center gap-2">
                      <Bus className="w-4 h-4 text-brand-blue" /> Assigned Vehicle:
                    </span>
                    <span className="font-bold text-brand-navy">{child.busNumber || 'Assigned Transit Bus'}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-border">
                    <span className="text-brand-slate font-medium flex items-center gap-2">
                      <RouteIcon className="w-4 h-4 text-brand-teal" /> Route Corridor:
                    </span>
                    <span className="font-bold text-brand-navy">{child.routeName || 'Corridor Route'}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-border">
                    <span className="text-brand-slate font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" /> Morning Boarding Stop:
                    </span>
                    <span className="font-bold text-brand-navy truncate max-w-[200px] text-right">
                      {child.pickupStop || 'Main Neighborhood Crossing'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-border">
                    <span className="text-brand-slate font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600" /> Afternoon Drop-off:
                    </span>
                    <span className="font-bold text-brand-navy truncate max-w-[200px] text-right">
                      {child.dropoffStop || 'School Main Drop-off Zone'}
                    </span>
                  </div>
                </div>

                {/* Privacy & Safety Guarantee */}
                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-brand-blue flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Student transport pass protected by multi-factor guardian authorization.</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChildrenProfilePage;
