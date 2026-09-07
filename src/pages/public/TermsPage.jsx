import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import Container from '../../components/layout/Container';

export const TermsPage = () => {
  return (
    <PublicLayout>
      <div className="bg-slate-50 min-h-screen py-12">
        <Container className="max-w-4xl">
          <div className="mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-slate hover:text-brand-blue transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-border shadow-soft space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 text-brand-blue text-xs font-bold uppercase tracking-wider mb-2">
                <FileText className="w-3.5 h-3.5" /> Service Governance & Terms
              </div>
              <h1 className="text-3xl font-black text-brand-navy tracking-tight">
                RouteWise Terms of Service
              </h1>
              <p className="text-sm text-brand-slate mt-2">
                Standard platform operational terms for schools, transport staff, drivers, and guardians.
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
              <section className="space-y-2">
                <h2 className="text-lg font-bold text-brand-navy">1. Acceptance of Terms</h2>
                <p>
                  By accessing or utilizing RouteWise portals, school administrators, transport managers, drivers, and guardians agree to abide by these operating standards and all applicable student transportation safety guidelines.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-brand-navy">2. Authorized Role Conduct</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Drivers:</strong> Agree to initiate tracking solely during scheduled runs and ensure device operation does not interfere with safe vehicular handling.</li>
                  <li><strong>Guardians:</strong> Agree to maintain confidential account credentials and use tracking data solely for household logistical coordination.</li>
                  <li><strong>Administrators:</strong> Agree to configure rosters, stops, and fleet compliance assets accurately according to jurisdictional guidelines.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-brand-navy">3. System Availability & Safety Disclaimer</h2>
                <p>
                  RouteWise delivers real-time transit telemetry to assist logistics. However, automated GPS notifications should complement, not replace, institutional emergency procedures and direct school communications during extreme weather or unforeseen incidents.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-brand-navy">4. Account Integrity & Security</h2>
                <p>
                  Users must report any suspected unauthorized access or compromised credentials to school transport authorities immediately. RouteWise logs all security-relevant state modifications to an immutable audit trail.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
};

export default TermsPage;
