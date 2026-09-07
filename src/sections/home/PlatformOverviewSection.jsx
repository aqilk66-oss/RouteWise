import React from 'react';
import Container from '../../components/layout/Container';
import Section from '../../components/layout/Section';
import Badge from '../../components/ui/Badge';
import { School, Bus, Users, Shield, UserCheck, ArrowDownRight } from 'lucide-react';

export const PlatformOverviewSection = () => {
  const nodes = [
    { title: "Schools & Academies", role: "Central Command", icon: School, color: "text-brand-navy", bg: "bg-slate-100" },
    { title: "Fleet & Buses", role: "Active Telemetry", icon: Bus, color: "text-brand-blue", bg: "bg-blue-50" },
    { title: "Drivers", role: "Safety Manifest", icon: UserCheck, color: "text-brand-teal", bg: "bg-teal-50" },
    { title: "Parents & Guardians", role: "Live Reassurance", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
    { title: "Students", role: "Digital Transit Pass", icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <Section
      id="platform-overview"
      title="One platform. Complete transport visibility."
      subtitle="RouteWise replaces fragmented spreadsheets and radio calls with an integrated coordination hub."
      badge={<Badge variant="info">Ecosystem Architecture</Badge>}
      className="bg-slate-50 relative overflow-hidden"
    >
      <div className="max-w-5xl mx-auto">
        {/* Central Orchestration Architecture Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left Column Nodes */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-border shadow-soft flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center shrink-0">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy">Institutional Authority</h4>
                <p className="text-xs text-brand-slate mt-0.5">Control route schedules, speed boundaries, and emergency protocol dispatch.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-border shadow-soft flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center shrink-0">
                <Bus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy">Fleet Telemetry</h4>
                <p className="text-xs text-brand-slate mt-0.5">Automated geo-stamped tracking, fuel diagnostics, and route compliance.</p>
              </div>
            </div>
          </div>

          {/* Center Hub Graphic */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-navy via-slate-900 to-brand-navy text-white text-center shadow-floating border border-slate-700 relative flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white p-1.5 shadow-floating mb-4 flex items-center justify-center">
              <img src="/assets/logo.png" alt="RouteWise Core" className="w-full h-full object-contain" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">RouteWise Core</h3>
            <p className="text-xs text-brand-teal font-medium mt-1">Real-time Coordination Engine</p>
            <div className="w-full mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-around text-xs text-slate-300">
              <span>99.98% Telemetry Sync</span>
              <span>Zero Lost Checkpoints</span>
            </div>
          </div>

          {/* Right Column Nodes */}
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-border shadow-soft flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy">Guardian Peace of Mind</h4>
                <p className="text-xs text-brand-slate mt-0.5">Instant phone alerts when bus approaches home or student safely boards.</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-border shadow-soft flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy">Driver Assistance</h4>
                <p className="text-xs text-brand-slate mt-0.5">Turn-by-turn institutional navigation without distracted phone calling.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default PlatformOverviewSection;
