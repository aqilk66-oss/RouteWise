import React, { useState } from 'react';
import Section from '../../components/layout/Section';
import Badge from '../../components/ui/Badge';
import { ChevronDown } from 'lucide-react';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: "What is RouteWise?",
      a: "RouteWise is a commercial-grade school transportation management SaaS and real-time tracking platform connecting schools, drivers, students, and parents into a single synchronized mobility ecosystem."
    },
    {
      q: "Can parents track their child's specific bus in real time?",
      a: "Yes. The Parent Portal displays live bus coordinates, current speed, estimated arrival times for designated neighborhood stops, and arrival confirmations."
    },
    {
      q: "How does RouteWise assist bus drivers during active transit?",
      a: "Drivers use a dedicated Driver Console providing turn-by-turn route sequences, digital passenger boarding manifests, pre-trip safety checklists, and one-touch incident reporting."
    },
    {
      q: "Can schools configure and optimize multiple bus routes?",
      a: "Yes. School administrators and transport managers can build custom route paths, establish neighborhood pickup points, assign drivers, and monitor fleet metrics on an interactive bird's-eye map."
    },
    {
      q: "Does RouteWise support role-based access control?",
      a: "Yes. The platform includes dedicated workspaces and security permissions for Administrators, Transport Managers, Bus Drivers, Parents, and Students."
    },
    {
      q: "How will live GPS and attendance backend integration work?",
      a: "The architecture features a modular Firebase data layer (Cloud Firestore and Auth) and standardized GPS telemetry contracts ready for production satellite telemetry streams in upcoming stages."
    }
  ];

  return (
    <Section
      id="faq"
      title="Frequently Asked Questions"
      subtitle="Everything you need to know about RouteWise school transport management."
      badge={<Badge variant="default">Knowledge Base</Badge>}
      className="bg-slate-50 border-t border-border"
    >
      <div className="max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-border overflow-hidden shadow-subtle transition-all"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
                aria-expanded={isOpen}
              >
                <span className="text-sm font-bold text-brand-navy">{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-brand-slate shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-blue' : ''}`} />
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-xs text-brand-slate leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
};

export default FAQSection;
