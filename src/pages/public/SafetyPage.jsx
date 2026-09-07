import React from 'react';
import PublicLayout from '../../layouts/PublicLayout';
import SafetySection from '../../sections/home/SafetySection';
import TrustSection from '../../sections/home/TrustSection';
import FinalCTASection from '../../sections/home/FinalCTASection';
import { ShieldCheck, Lock, Bell, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

/**
 * RouteWise Safety & Compliance Page — Dedicated MPA Page (/safety)
 */
export const SafetyPage = () => {
  return (
    <PublicLayout>
      {/* Safety Page Header */}
      <section className="relative pt-16 pb-12 bg-gradient-to-b from-brand-navy/5 via-transparent to-transparent">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-brand-teal/30 text-brand-teal text-xs font-bold mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Institutional Safety Architecture</span>
          </div>
          <h1 className="text-display text-brand-navy font-extrabold tracking-tight mb-4">
            Safety engineered into every transit mile.
          </h1>
          <p className="text-body-large text-brand-slate leading-relaxed mb-8">
            Student protection isn't an afterthought. RouteWise combines automated check-in rosters, emergency SOS response dispatch, and rigorous vehicle inspection workflows.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left mb-8">
            <div className="p-5 rounded-2xl bg-white border border-border shadow-subtle flex flex-col items-start">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-blue flex items-center justify-center mb-3">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-brand-navy mb-1">Roster Verification</h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                NFC and manual check-ins prevent students from boarding incorrect buses or disembarking at incorrect stops.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-border shadow-subtle flex flex-col items-start">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-brand-navy mb-1">Instant SOS Dispatch</h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                One-tap driver emergency alert with real-time GPS coordinates dispatched simultaneously to admins and emergency teams.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-border shadow-subtle flex flex-col items-start">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center mb-3">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-brand-navy mb-1">Encrypted Telematics</h3>
              <p className="text-xs text-brand-slate leading-relaxed">
                Role-based access controls and encrypted student data strictly protect minor identity records.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/register">
              <Button variant="secondary" size="md" icon={ArrowRight} iconPosition="right">
                Register Student Account
              </Button>
            </Link>
            <Link to="/features">
              <Button variant="outline" size="md">
                View All Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Safety Section */}
      <SafetySection />

      {/* Trust & Compliance Grid */}
      <TrustSection />

      {/* Call to Action */}
      <FinalCTASection />
    </PublicLayout>
  );
};

export default SafetyPage;
