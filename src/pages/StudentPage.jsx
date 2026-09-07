import React from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { UserCheck, Bus, MapPin, Calendar } from 'lucide-react';

export const StudentPage = () => {
  return (
    <DashboardLayout role="Student" title="Student Transit Pass & Schedule">
      <div className="space-y-6">
        <div className="p-6 rounded-2xl bg-white border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-brand-navy">Digital Student Transit Pass</h2>
            <p className="text-xs text-brand-slate">Student ID: #STU-2026-8831 • Route: Blue Line 3</p>
          </div>
          <Badge variant="active" size="md">Valid Pass</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card variant="elevated">
            <h4 className="font-bold text-sm text-brand-navy mb-2 flex items-center gap-2">
              <Bus className="w-4 h-4 text-brand-blue" />
              <span>Assigned Bus Details</span>
            </h4>
            <p className="text-xs text-brand-slate">Bus: #08 (Seats available: 6)</p>
            <p className="text-xs font-semibold text-brand-navy mt-1">Pickup Point: Elm Street Crossing</p>
          </Card>
          <Card variant="elevated">
            <h4 className="font-bold text-sm text-brand-navy mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-teal" />
              <span>Transit Timetable</span>
            </h4>
            <p className="text-xs text-brand-slate">Morning Pickup: 07:25 AM</p>
            <p className="text-xs text-brand-slate mt-1">Afternoon Return: 03:40 PM</p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentPage;
