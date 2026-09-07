import React, { useState } from 'react';
import Section from '../../components/layout/Section';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import GlassPanel from '../../components/ui/GlassPanel';
import { Bus, MapPin, Gauge, ShieldCheck, Radio, ChevronRight, User } from 'lucide-react';

export const BusTrackingSection = () => {
  const [selectedBus, setSelectedBus] = useState('bus-24');

  const fleet = [
    { id: 'bus-24', label: 'Bus #24', driver: 'Robert J.', route: 'North Campus Loop', speed: '32 mph', eta: '08 min', status: 'On Route' },
    { id: 'bus-12', label: 'Bus #12', driver: 'Sarah M.', route: 'East Residential', speed: '24 mph', eta: '14 min', status: 'On Route' },
    { id: 'bus-08', label: 'Bus #08', driver: 'David K.', route: 'West Valley Express', speed: '0 mph', eta: 'At Depot', status: 'Scheduled' },
  ];

  const activeBus = fleet.find((b) => b.id === selectedBus) || fleet[0];

  return (
    <Section
      id="tracking-demo"
      title="Know where the bus is. Before you need to ask."
      subtitle="Eliminate parent anxiety with continuous GPS position telemetry, speed threshold tracking, and geofence entry alerts."
      badge={<Badge variant="active" dot>Real-Time Tracking Engine</Badge>}
      className="bg-slate-900 text-white relative overflow-hidden"
    >
      {/* Background ambient dark glows */}
      <div className="absolute -top-40 left-1/3 w-[600px] h-[600px] bg-brand-blue/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-40 right-10 w-[500px] h-[500px] bg-brand-teal/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Tracking Interface Simulation Console */}
        <div className="rounded-3xl bg-slate-950 border border-slate-800 shadow-floating overflow-hidden">
          {/* Top Bar */}
          <div className="p-4 sm:p-6 bg-slate-900/90 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/20 text-brand-blue flex items-center justify-center border border-brand-blue/30">
                <Radio className="w-5 h-5 animate-pulse text-brand-teal" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Live Tracking Dispatcher Preview</h3>
                <p className="text-xs text-slate-400">Continuous telemetry feed • 1-sec latency threshold</p>
              </div>
            </div>

            {/* Fleet Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {fleet.map((bus) => (
                <button
                  key={bus.id}
                  onClick={() => setSelectedBus(bus.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    selectedBus === bus.id
                      ? 'bg-brand-blue text-white shadow-soft'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {bus.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Simulated Map & Telemetry Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[400px]">
            {/* Left Simulated GIS Map Canvas View */}
            <div className="lg:col-span-8 p-6 sm:p-8 bg-slate-900/60 relative flex flex-col justify-between overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
              {/* Simulated Map Grid Lines */}
              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

              {/* Simulated SVG Route Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 600 350">
                <path
                  d="M 50 280 C 150 260, 220 120, 360 160 S 500 80, 560 60"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 50 280 C 150 260, 220 120, 360 160 S 500 80, 560 60"
                  fill="none"
                  stroke="#14B8A6"
                  strokeWidth="3"
                  strokeDasharray="8 8"
                  strokeLinecap="round"
                />
              </svg>

              {/* Waypoint Pins on Map */}
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-slate-800/90 border border-slate-700 backdrop-blur-md text-xs text-slate-300 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Geo-Coordinate: 40.7128° N, 74.0060° W</span>
                </div>
                <Badge variant="active" size="sm" dot>GPS Live</Badge>
              </div>

              {/* Dynamic Moving Bus Widget on Map */}
              <div className="relative z-10 self-center my-12 p-4 rounded-2xl bg-brand-navy/90 border border-brand-teal/40 shadow-floating backdrop-blur-md max-w-xs text-center animate-bounce-subtle">
                <div className="w-10 h-10 rounded-full bg-brand-blue mx-auto flex items-center justify-center text-white mb-2 shadow-soft">
                  <Bus className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">{activeBus.label} — In Motion</h4>
                <p className="text-xs text-brand-teal font-mono mt-0.5">Speed: {activeBus.speed}</p>
              </div>

              {/* Bottom GIS Legend */}
              <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800">
                <span>Route: {activeBus.route}</span>
                <span>Signal Strength: 98% (4G LTE Telemetry)</span>
              </div>
            </div>

            {/* Right Telemetry Telemetry Spec Panel */}
            <div className="lg:col-span-4 p-6 sm:p-8 bg-slate-950 flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-xs uppercase font-bold tracking-wider text-slate-400 mb-4">
                  Vehicle Telemetry Stream
                </h4>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-xs text-slate-400 block mb-1">Estimated Time to Arrival</span>
                    <span className="text-2xl font-black text-brand-teal font-mono">{activeBus.eta}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Assigned Driver</span>
                      <span className="text-sm font-bold text-white">{activeBus.driver}</span>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                      <User className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Speed Limiter Compliance</span>
                      <span className="text-sm font-bold text-emerald-400">Normal (Safe Zone)</span>
                    </div>
                    <Gauge className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-brand-blue/10 border border-brand-blue/20 text-xs text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-teal shrink-0" />
                <span>Geofence safety monitoring active for all stops</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
};

export default BusTrackingSection;
