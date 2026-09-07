import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/layout/Container';
import Button from '../../components/ui/Button';
import { ArrowRight, ShieldCheck, Bus } from 'lucide-react';

export const FinalCTASection = () => {
  return (
    <section className="py-20 bg-brand-navy text-white relative overflow-hidden">
      {/* Subtle atmospheric gradient circles */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-brand-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-brand-teal/15 rounded-full blur-[100px] pointer-events-none" />

      <Container className="relative z-10 text-center max-w-3xl">
        <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-brand-teal flex items-center justify-center mx-auto mb-6 shadow-floating backdrop-blur-md">
          <Bus className="w-8 h-8" />
        </div>

        <h2 className="text-display text-white tracking-tight mb-4">
          Take control of every route.
        </h2>

        <p className="text-body-large text-slate-300 max-w-xl mx-auto mb-8">
          Bring schools, buses, drivers, and families into one smarter, safer transport experience today.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <Link to="/register" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              icon={ArrowRight}
              iconPosition="right"
              className="w-full sm:w-auto shadow-floating"
            >
              Get Started with RouteWise
            </Button>
          </Link>
          <a href="#contact" className="w-full sm:w-auto">
            <Button
              variant="glass"
              size="lg"
              className="w-full sm:w-auto text-white border-white/30 hover:bg-white/20"
            >
              Contact Platform Team
            </Button>
          </a>
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-brand-teal font-medium bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <ShieldCheck className="w-4 h-4" />
          <span>Institutional Pilot Onboarding Available</span>
        </div>
      </Container>
    </section>
  );
};

export default FinalCTASection;
