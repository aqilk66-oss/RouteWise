import React from 'react';
import Section from '../../components/layout/Section';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Quote } from 'lucide-react';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Before RouteWise, our morning school phone line was flooded with parents asking where the bus was. With live ETA links, morning call volume dropped to zero.",
      author: "Marcus Vance",
      role: "Director of Student Transportation",
      organization: "Oakridge District Academy",
    },
    {
      quote: "As a parent, knowing Emily has boarded the bus and receiving an alert the second she reaches school relieves morning stress completely.",
      author: "Elena Rostova",
      role: "Parent & PTA Coordinator",
      organization: "Parent Community Association",
    },
    {
      quote: "Having my passenger list automatically checked as kids enter without fumbling through clipboards keeps my focus strictly on the road and student safety.",
      author: "James Thorne",
      role: "Senior Route Driver (12 yrs exp)",
      organization: "Metro Charter Transit Fleet",
    },
  ];

  return (
    <Section
      id="testimonials"
      title="Trusted by operators and families alike."
      subtitle="Sample perspectives illustrating the real-world operational impact of RouteWise."
      badge={<Badge variant="info">Community Feedback</Badge>}
      className="bg-white border-t border-border"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((t, idx) => (
          <Card
            key={idx}
            variant="elevated"
            className="p-6 sm:p-8 flex flex-col justify-between border border-border/80"
          >
            <div>
              <Quote className="w-8 h-8 text-brand-blue/20 mb-4" />
              <p className="text-xs sm:text-sm text-brand-navy leading-relaxed italic mb-6">
                &ldquo;{t.quote}&rdquo;
              </p>
            </div>
            <div className="pt-4 border-t border-border">
              <h4 className="text-xs font-bold text-brand-navy">{t.author}</h4>
              <p className="text-[11px] text-brand-blue font-semibold">{t.role}</p>
              <p className="text-[10px] text-brand-slate">{t.organization}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
};

export default TestimonialsSection;
