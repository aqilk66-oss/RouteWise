import React from 'react';
import Container from '../../components/layout/Container';
import { ShieldCheck, Cpu, Radio, Award } from 'lucide-react';

export const TrustSection = () => {
  const trustFeatures = [
    {
      icon: ShieldCheck,
      title: "Student Safety Priority",
      description: "Automated check-ins and verified boarding rosters for complete guardian reassurance.",
    },
    {
      icon: Radio,
      title: "Sub-Second Telemetry",
      description: "High-frequency GPS position refresh with automated delay and ETA recalculations.",
    },
    {
      icon: Cpu,
      title: "Intelligent Dispatch",
      description: "Multi-point route balancing and stop clustering to minimize transit fatigue.",
    },
    {
      icon: Award,
      title: "Enterprise Reliability",
      description: "Engineered with failover redundancies for continuous institutional uptime.",
    },
  ];

  return (
    <section className="py-12 bg-white border-y border-border relative">
      <Container>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase font-bold tracking-widest text-brand-blue mb-2">
            Institutional Transit Infrastructure
          </p>
          <h2 className="text-h2 text-brand-navy">
            One unified platform for safer, smarter school transportation.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustFeatures.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-surface-subtle/70 border border-border hover:border-brand-blue/30 transition-all hover:bg-white hover:shadow-soft flex flex-col items-start"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-border shadow-subtle text-brand-navy flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-brand-blue" />
                </div>
                <h3 className="text-sm font-bold text-brand-navy mb-1.5">{item.title}</h3>
                <p className="text-xs text-brand-slate leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
};

export default TrustSection;
