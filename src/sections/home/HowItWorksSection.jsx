import React from 'react';
import Section from '../../components/layout/Section';
import Badge from '../../components/ui/Badge';

export const HowItWorksSection = () => {
  const steps = [
    {
      step: '01',
      title: 'Configure Fleet & Routes',
      description: 'Upload institutional campuses, designate safe neighborhood pickup stops, and build balanced routes.',
    },
    {
      step: '02',
      title: 'Assign Drivers & Students',
      description: 'Pair certified drivers with vehicles and provision NFC digital transit passes to registered student rosters.',
    },
    {
      step: '03',
      title: 'Real-Time Telemetry Tracking',
      description: 'Buses transmit automated GPS positions while speed limiters and geofence checkpoints update live status.',
    },
    {
      step: '04',
      title: 'Synchronize All Stakeholders',
      description: 'Schools, parents, and drivers remain in continuous, clear communication with instant boarding and arrival alerts.',
    },
  ];

  return (
    <Section
      id="how-it-works"
      title="How RouteWise transforms your transport."
      subtitle="From institutional onboarding to daily morning departure in four structured steps."
      badge={<Badge variant="default">Implementation Workflow</Badge>}
      className="bg-white border-t border-border"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, idx) => (
            <div
              key={item.step}
              className="p-6 rounded-2xl bg-surface-subtle/70 border border-border flex flex-col justify-between hover:bg-white hover:shadow-soft transition-all"
            >
              <div>
                <span className="text-3xl font-black font-mono text-brand-blue/30 block mb-3">
                  {item.step}
                </span>
                <h3 className="text-sm font-bold text-brand-navy mb-2">{item.title}</h3>
                <p className="text-xs text-brand-slate leading-relaxed">{item.description}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-semibold text-brand-blue">
                <span>Phase {item.step} Operational</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default HowItWorksSection;
