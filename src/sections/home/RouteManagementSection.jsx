import React from 'react';
import Section from '../../components/layout/Section';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Map, Clock, ArrowRight, CheckCircle2, Navigation } from 'lucide-react';

export const RouteManagementSection = () => {
  const scheduleStops = [
    { time: "07:35 AM", stop: "Maple Avenue & 4th Street", students: "4 Students", status: "Completed" },
    { time: "07:48 AM", stop: "Lincoln Park Community Hub", students: "6 Students", status: "In Transit" },
    { time: "08:02 AM", stop: "Highland Heights Crossing", students: "5 Students", status: "Scheduled" },
    { time: "08:15 AM", stop: "North Campus Main Bus Port", students: "Terminal", status: "Destination" },
  ];

  return (
    <Section
      id="route-management"
      title="Plan smarter routes. Manage every journey."
      subtitle="Reduce route commute times, eliminate unnecessary road overlaps, and dynamically adjust stops when students are absent."
      badge={<Badge variant="onroute">Intelligent Dispatch</Badge>}
      className="bg-white border-t border-border"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
        {/* Left Column: Narrative & Highlights */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-brand-blue flex items-center justify-center shrink-0 mt-0.5">
                <Navigation className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy">Multi-Stop Sequence Balancing</h4>
                <p className="text-xs text-brand-slate mt-1">
                  Algorithmic routing groups stops intelligently to reduce bus idling and fuel consumption by up to 24%.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-brand-teal flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-brand-navy">Live Schedule Synchronization</h4>
                <p className="text-xs text-brand-slate mt-1">
                  Traffic incidents automatically recalculate downstream arrival ETAs and alert awaiting families.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Route Manifest Demo Card */}
        <div className="lg:col-span-7">
          <Card variant="elevated" className="border border-border/80 shadow-floating p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-border gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="active" size="sm" dot>Live Route Demo</Badge>
                  <span className="text-xs font-mono text-brand-slate">Line 14-AM</span>
                </div>
                <h3 className="text-base font-bold text-brand-navy">North Campus Express Transit</h3>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-brand-slate block">Estimated Total Transit</span>
                <span className="text-sm font-bold text-brand-blue">40 Minutes • 15 Stops</span>
              </div>
            </div>

            {/* Stop Timeline */}
            <div className="mt-6 space-y-4">
              {scheduleStops.map((stop, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-brand-navy w-16">{stop.time}</span>
                    <div className="w-2 h-2 rounded-full bg-brand-blue shrink-0" />
                    <span className="text-xs font-medium text-brand-navy truncate max-w-[200px] sm:max-w-none">{stop.stop}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-brand-slate hidden sm:inline">{stop.students}</span>
                    <Badge
                      variant={stop.status === 'Completed' ? 'success' : stop.status === 'In Transit' ? 'active' : 'default'}
                      size="sm"
                    >
                      {stop.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
};

export default RouteManagementSection;
