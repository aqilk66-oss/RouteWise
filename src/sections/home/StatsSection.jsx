import React from 'react';
import Container from '../../components/layout/Container';

export const StatsSection = () => {
  const metrics = [
    { value: '24', label: 'Configured Sample Routes', detail: 'Covering urban & suburban routes' },
    { value: '18', label: 'Active Monitored Buses', detail: 'Equipped with live telemetry simulation' },
    { value: '5', label: 'Integrated Role Personas', detail: 'Admin, Dispatcher, Driver, Parent, Student' },
    { value: '< 1s', label: 'Simulated GPS Latency', detail: 'High-speed real-time updates' },
  ];

  return (
    <section className="py-16 bg-brand-navy text-white relative overflow-hidden border-y border-slate-800">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <Container>
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs uppercase font-bold tracking-widest text-brand-teal mb-2">
            Engineered For Scale
          </p>
          <h2 className="text-h2 text-white">Platform telemetry at a glance.</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {metrics.map((stat, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm">
              <span className="text-3xl sm:text-4xl font-extrabold text-brand-teal font-mono block mb-1">
                {stat.value}
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-white mb-1">{stat.label}</h3>
              <p className="text-[11px] text-slate-400">{stat.detail}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default StatsSection;
