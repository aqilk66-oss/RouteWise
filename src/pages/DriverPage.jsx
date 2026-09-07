import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { Bus, Navigation, CheckCircle2, AlertTriangle } from 'lucide-react';

export const DriverPage = () => {
  return (
    <DashboardLayout role="Driver" title="Driver Console & Route Manifest">
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-white border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Bus #24 — Morning Express Route</h2>
            <p className="text-xs text-brand-slate">Assigned Vehicle: Volvo 9700 (License: NY-TRP-882)</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="onroute" size="md" dot>Trip Ready</Badge>
            <Button variant="success" size="sm">Start Route</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="elevated">
            <h4 className="font-bold text-sm text-brand-navy mb-2 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-brand-blue" />
              <span>Upcoming Checkpoint</span>
            </h4>
            <p className="text-sm font-semibold text-brand-navy">Oakridge Elementary North Gate</p>
            <p className="text-xs text-brand-slate mt-1">Scheduled Time: 07:45 AM • 8 Students boarding</p>
          </Card>
          <Card variant="elevated">
            <h4 className="font-bold text-sm text-brand-navy mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Safety Checklist Status</span>
            </h4>
            <p className="text-xs text-brand-slate">Tire pressure, brakes, emergency door, and first-aid kit verified.</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DriverPage;
