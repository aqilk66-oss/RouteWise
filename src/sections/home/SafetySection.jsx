import React from 'react';
import Section from '../../components/layout/Section';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { ShieldCheck, Lock, BellRing, PhoneCall, AlertTriangle, UserCheck } from 'lucide-react';

export const SafetySection = () => {
  const safetyPillars = [
    {
      icon: UserCheck,
      title: "Verified Driver Credentialing",
      description: "Automated license status validation, background checks, and active breathalyzer shift confirmation logs.",
    },
    {
      icon: BellRing,
      title: "Geofence Safe-Zone Alerts",
      description: "Instant notification when the bus crosses within 500 meters of the scheduled pickup or school entrance perimeter.",
    },
    {
      icon: ShieldCheck,
      title: "Roster Boarding Authentication",
      description: "Students scan their digital NFC transit pass upon entering; parents immediately receive a boarding timestamp confirmation.",
    },
    {
      icon: PhoneCall,
      title: "Emergency Dispatch Redundancy",
      description: "One-touch SOS channel connects the driver immediately to school administration and local emergency responders.",
    },
  ];

  return (
    <Section
      id="safety"
      title="Built around student safety."
      subtitle="Every software decision inside RouteWise is centered on the physical security and guardian reassurance of traveling children."
      badge={<Badge variant="success" dot>Zero-Compromise Security</Badge>}
      className="bg-white border-t border-border"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {safetyPillars.map((pillar, idx) => {
          const Icon = pillar.icon;
          return (
            <Card
              key={idx}
              variant="elevated"
              className="border border-border/80 hover:border-brand-teal/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-brand-teal flex items-center justify-center mb-4 border border-brand-teal/20">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-brand-navy mb-2">{pillar.title}</h3>
                <p className="text-xs text-brand-slate leading-relaxed">{pillar.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-brand-teal">
                <ShieldCheck className="w-4 h-4" />
                <span>Protected Standard</span>
              </div>
            </Card>
          );
        })}
      </div>
    </Section>
  );
};

export default SafetySection;
