import React from 'react';
import PublicLayout from '../../layouts/PublicLayout';
import BusTrackingSection from '../../sections/home/BusTrackingSection';
import FinalCTASection from '../../sections/home/FinalCTASection';
import { Radio, Shield, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

/**
 * RouteWise Live Tracking Page — Dedicated MPA Page (/tracking)
 */
export const LiveTrackingPage = () => {
  return (
    <PublicLayout>
      {/* Tracking Page Header */}
      <section className="relative pt-16 pb-8 bg-slate-900 text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-teal/20 text-brand-teal text-xs font-bold mb-4 border border-brand-teal/30">
            <Radio className="w-3.5 h-3.5 animate-pulse text-brand-teal" />
            <span>High-Frequency GPS Stream</span>
          </div>
          <h1 className="text-display text-white font-extrabold tracking-tight mb-4">
            Live Fleet Tracking & Telematics
          </h1>
          <p className="text-body-large text-slate-300 leading-relaxed mb-6">
            Experience real-time vehicle positioning, automated delay recalculations, and geofenced arrival notifications.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-6 text-left">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-brand-teal text-xs font-bold mb-1">
                <Clock className="w-4 h-4" />
                <span>1-Sec Latency</span>
              </div>
              <p className="text-xs text-slate-400">Continuous telemetry feed refreshed every second.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-brand-blue text-xs font-bold mb-1">
                <MapPin className="w-4 h-4" />
                <span>Geofencing</span>
              </div>
              <p className="text-xs text-slate-400">Automated perimeter alerts upon school or stop entry.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <Shield className="w-4 h-4" />
                <span>Roster Match</span>
              </div>
              <p className="text-xs text-slate-400">Boarding verification tied directly to student passes.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/parent">
              <Button variant="secondary" size="md" icon={ArrowRight} iconPosition="right">
                Open Parent Live Hub
              </Button>
            </Link>
            <Link to="/driver">
              <Button variant="glass" size="md" className="text-white border-slate-700 hover:bg-slate-800">
                Driver Navigation HUD
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Interactive Tracking Simulation Console */}
      <BusTrackingSection />

      {/* Conversion CTA */}
      <FinalCTASection />
    </PublicLayout>
  );
};

export default LiveTrackingPage;
