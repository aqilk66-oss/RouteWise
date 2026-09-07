import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, ArrowLeft } from 'lucide-react';
import PublicLayout from '../../layouts/PublicLayout';
import Container from '../../components/layout/Container';

export const PrivacyPage = () => {
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-teal/10 text-brand-teal text-xs font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5" /> Data Minimization & Privacy Foundation
              </div>
              <h1 className="text-3xl font-black text-brand-navy tracking-tight">
                RouteWise Platform Privacy Policy
              </h1>
              <p className="text-sm text-brand-slate mt-2">
                Last updated: September 2026 • Effective for all school transport operations.
              </p>
            </div>

            <div className="space-y-6 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
              <section className="space-y-2">
                <h2 className="text-lg font-bold text-brand-navy">1. Core Philosophy: Data Minimization</h2>
                <p>
                  RouteWise is designed strictly for safe, verifiable student transit logistics. We collect and process only the minimal data elements strictly required to ensure passenger safety, facilitate route dispatch, and alert guardians of transport arrival times.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-brand-navy">2. Information We Collect</h2>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Account Metadata:</strong> Names, authorized email addresses, and phone numbers for dispatch alerts.</li>
                  <li><strong>Student Rostering:</strong> Student names, assigned grade, school affiliation, and assigned bus stop coordinates.</li>
                  <li><strong>Active Transit Telematics:</strong> Vehicle GPS coordinates, speed, and heading collected strictly during active, driver-initiated trips.</li>
                  <li><strong>Attendance Logs:</strong> Timestamps and stop check-ins recorded by drivers to confirm safe student boarding and egress.</li>
                  <li><strong>Fleet & Safety Records:</strong> Vehicle inspection checklists, mechanical defect reports, and incident logs.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-brand-navy">3. Telematics & GPS Privacy</h2>
                <p>
                  Continuous or background location tracking is strictly forbidden. GPS telematics are transmitted only when an authorized driver enters an active trip corridor. Location listeners are dismantled immediately upon trip completion or account logout.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-brand-navy">4. Strict Role & School Scoping</h2>
                <p>
                  Access control follows least-privilege standards:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Parents:</strong> Authorized to inspect attendance and transit tracking solely for their own registered children.</li>
                  <li><strong>Drivers:</strong> Limited to the passenger rosters and stops of their currently assigned route and trip.</li>
                  <li><strong>School Administrators:</strong> Restricted to records of their designated educational institution. Cross-school data visibility is denied at the database rule level.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-brand-navy">5. Third-Party Integrations</h2>
                <p>
                  Third-party integrations are limited to functional necessities (EmailJS for emergency notifications, OpenStreetMap for map tiles). RouteWise never sells or licenses passenger data to commercial marketing third parties.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-lg font-bold text-brand-navy">6. Policy Inquiries & Legal Governance</h2>
                <p>
                  Institutions utilizing RouteWise may maintain specific regional regulatory compliance agreements. For privacy inquiries or student data export requests, please contact your participating school district transport authority.
                </p>
              </section>
            </div>
          </div>
        </Container>
      </div>
    </PublicLayout>
  );
};

export default PrivacyPage;
