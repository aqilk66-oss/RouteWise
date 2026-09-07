import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Users, MapPin, Phone, ShieldCheck } from 'lucide-react';

export const ParentPage = () => {
  return (
    <DashboardLayout role="Parent" title="Parent Portal & Guardian Tracking">
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-white border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Assigned Student: Emily Watson (Grade 5)</h2>
            <p className="text-xs text-brand-slate">School: St. Jude Academy • Bus Number: #12</p>
          </div>
          <Badge variant="active" size="md" dot>Boarded & In Transit</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="elevated">
            <h4 className="font-bold text-sm text-brand-navy mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-blue" />
              <span>Current Bus Location</span>
            </h4>
            <p className="text-xs text-brand-slate">Main Boulevard 4th Cross (2.1 miles away from home)</p>
            <p className="text-xs font-bold text-brand-blue mt-2">Estimated Arrival: 08:12 AM (In 7 mins)</p>
          </Card>
          <Card variant="elevated">
            <h4 className="font-bold text-sm text-brand-navy mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4 text-brand-teal" />
              <span>Driver Contact & Verification</span>
            </h4>
            <p className="text-xs text-brand-slate">Driver: Robert Jenkins (Badge #RJ-44)</p>
            <p className="text-xs text-slate-500 mt-1">Direct Driver Contact: +1 (555) 019-2834</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentPage;
