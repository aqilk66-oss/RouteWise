import React, { useState } from 'react';
import Section from '../../components/layout/Section';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Users, Bus, School, UserCheck, CheckCircle2, Clock, MapPin, AlertCircle } from 'lucide-react';

export const RoleExperiencesSection = () => {
  const [activeTab, setActiveTab] = useState('parent');

  const tabs = [
    { id: 'parent', label: 'Parent / Guardian', icon: Users },
    { id: 'driver', label: 'Bus Driver', icon: Bus },
    { id: 'admin', label: 'School Admin', icon: School },
  ];

  return (
    <Section
      id="roles"
      title="Tailored experiences for every stakeholder."
      subtitle="Whether you are waiting at the bus stop, navigating morning traffic, or managing a district fleet, RouteWise provides the exact toolset you need."
      badge={<Badge variant="info">Multi-Role Portals</Badge>}
      className="bg-slate-50 border-t border-border"
    >
      <div className="max-w-5xl mx-auto">
        {/* Role Tab Selector */}
        <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  isActive
                    ? 'bg-brand-navy text-white shadow-soft'
                    : 'bg-white text-brand-slate border border-border hover:text-brand-navy hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Parent Experience Preview */}
        {activeTab === 'parent' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs uppercase font-bold tracking-wider text-brand-blue">Parent Portal Reassurance</span>
              <h3 className="text-h2 text-brand-navy">Peace of mind starts with visibility.</h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                Parents track the bus in real time, view exact pickup estimates, and receive immediate alerts when their child safely boards or arrives at school.
              </p>
              <ul className="space-y-2 text-xs text-brand-navy pt-2 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time ETA with traffic delay adjustments</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Push alert when bus is 2 stops away</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Direct driver messaging during active shifts</li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <Card variant="spatial" className="border border-white/80 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-sm">
                      EW
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-brand-navy">Emily Watson</h4>
                      <p className="text-xs text-brand-slate">Grade 5 • Route #14 North Express</p>
                    </div>
                  </div>
                  <Badge variant="active" size="sm" dot>Boarded (07:42 AM)</Badge>
                </div>

                <div className="p-4 rounded-xl bg-blue-50/70 border border-brand-blue/20 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-brand-slate block">Expected School Arrival</span>
                    <span className="text-lg font-black text-brand-navy font-mono">08:15 AM</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-brand-slate block">Current Stop</span>
                    <span className="text-xs font-bold text-brand-blue">Stop 8 / 12</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 2: Driver Experience Preview */}
        {activeTab === 'driver' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs uppercase font-bold tracking-wider text-brand-teal">Driver Console Focus</span>
              <h3 className="text-h2 text-brand-navy">Give drivers the clarity they need.</h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                Drivers receive turn-by-turn institutional route guidance, automated passenger check-offs, and simple safety checklists without phone distractions.
              </p>
              <ul className="space-y-2 text-xs text-brand-navy pt-2 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Pre-trip vehicle safety checklist</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Tap-to-board passenger list confirmation</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-teal" /> Hands-free road hazard voice announcements</li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <Card variant="spatial" className="border border-white/80 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <span className="text-xs font-mono text-brand-slate">Bus #24 Console</span>
                    <h4 className="text-sm font-bold text-brand-navy">Morning Route Manifest</h4>
                  </div>
                  <Badge variant="onroute" size="sm">Active Shift</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-brand-slate block">Next Checkpoint</span>
                    <span className="text-xs font-bold text-brand-navy">Oakridge Elementary North</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] text-brand-slate block">Boarding Count</span>
                    <span className="text-xs font-bold text-brand-navy">18 / 22 Boarded</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Tab 3: Admin Experience Preview */}
        {activeTab === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs uppercase font-bold tracking-wider text-brand-navy">Administration Fleet Control</span>
              <h3 className="text-h2 text-brand-navy">Transport management without the chaos.</h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                Transportation directors monitor all active vehicles on an interactive bird&apos;s-eye dashboard, manage driver assignments, and produce audit-ready safety reports.
              </p>
              <ul className="space-y-2 text-xs text-brand-navy pt-2 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> District-wide bird&apos;s-eye fleet map</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> Dynamic route re-assignment during road closures</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-blue" /> Comprehensive speed and idle time compliance metrics</li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <Card variant="spatial" className="border border-white/80 p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <span className="text-xs font-mono text-brand-slate">Institutional Operations</span>
                    <h4 className="text-sm font-bold text-brand-navy">District Central Fleet Status</h4>
                  </div>
                  <Badge variant="success" size="sm">18 / 20 In Service</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-base font-bold text-brand-navy">24</span>
                    <span className="text-[10px] text-brand-slate block">Active Routes</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-base font-bold text-brand-navy">482</span>
                    <span className="text-[10px] text-brand-slate block">Students Moved</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-base font-bold text-brand-teal">99.4%</span>
                    <span className="text-[10px] text-brand-slate block">On-Time Rate</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
};

export default RoleExperiencesSection;
