import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { ShieldCheck, UserCheck, Map, Settings } from 'lucide-react';

export const AdminPage = () => {
  return (
    <DashboardLayout role="Admin" title="School Transport Administrator Portal">
      <div className="space-y-6">
        <div className="flex items-center justify-between p-6 rounded-2xl bg-white border border-border">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Fleet Operations Center</h2>
            <p className="text-xs text-brand-slate">Institutional route controls, stop assignments, and driver rosters.</p>
          </div>
          <Badge variant="active" size="md">Admin Mode</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="interactive" className="p-5">
            <Map className="w-6 h-6 text-brand-blue mb-3" />
            <h4 className="font-bold text-sm text-brand-navy">Route Management</h4>
            <p className="text-xs text-brand-slate mt-1">24 Active institutional bus lines configured.</p>
          </Card>
          <Card variant="interactive" className="p-5">
            <UserCheck className="w-6 h-6 text-brand-teal mb-3" />
            <h4 className="font-bold text-sm text-brand-navy">Driver Verification</h4>
            <p className="text-xs text-brand-slate mt-1">All driver certifications up to date.</p>
          </Card>
          <Card variant="interactive" className="p-5">
            <Settings className="w-6 h-6 text-brand-slate mb-3" />
            <h4 className="font-bold text-sm text-brand-navy">Safety Thresholds</h4>
            <p className="text-xs text-brand-slate mt-1">Speed limit, geofence, and check-in parameters.</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminPage;
