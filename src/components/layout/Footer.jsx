import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, ArrowUpRight } from 'lucide-react';
import Container from './Container';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Live Bus Tracking', href: '/tracking' },
        { label: 'Smart Route Optimizer', href: '/features' },
        { label: 'Student Safety Grid', href: '/safety' },
        { label: 'Platform Capabilities', href: '/features' },
      ],
    },
    {
      title: 'Platform Portals',
      links: [
        { label: 'Parent Portal', href: '/parent' },
        { label: 'Driver Console', href: '/driver' },
        { label: 'Student Pass', href: '/student' },
        { label: 'School Admin Dashboard', href: '/admin' },
      ],
    },
    {
      title: 'Organization',
      links: [
        { label: 'About RouteWise', href: '/' },
        { label: 'Safety Protocols', href: '/safety' },
        { label: 'Fleet Features', href: '/features' },
        { label: 'Live Telematics', href: '/tracking' },
      ],
    },
    {
      title: 'Compliance & Legal',
      links: [
        { label: 'Student Data Privacy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Security Standards', href: '/safety' },
        { label: 'Accessibility Audit', href: '/features' },
      ],
    },
  ];

  return (
    <footer className="bg-brand-navy text-white mt-auto relative overflow-hidden border-t border-slate-800">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-brand-teal/50 to-transparent" />

      <Container className="py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-12 border-b border-slate-700/60">
          {/* Brand Bio */}
          <div className="lg:col-span-2 flex flex-col items-start">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-white p-0.5 overflow-hidden border border-brand-blue/30 flex items-center justify-center">
                <img
                  src="/assets/logo.png"
                  alt="RouteWise Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">RouteWise</span>
            </Link>
            <p className="text-sm text-slate-300 leading-relaxed mb-6 max-w-sm">
              The next-generation school transport operations platform. Connecting schools, parents, and drivers with real-time GPS telemetry, geofence alerts, and intelligent route security.
            </p>
            <div className="flex items-center gap-2 text-xs text-brand-teal font-medium bg-brand-teal/10 px-3 py-1.5 rounded-full border border-brand-teal/20">
              <ShieldCheck className="w-4 h-4" />
              <span>Enterprise Grade Safety Protocol</span>
            </div>
          </div>

          {/* Navigation Columns */}
          {footerSections.map((section) => (
            <div key={section.title} className="flex flex-col">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                {section.title}
              </h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-xs text-slate-300 hover:text-brand-teal transition-colors flex items-center gap-1 group"
                    >
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {currentYear} RouteWise Technologies Inc. Every Route, Under Control.</p>
          <div className="flex items-center gap-6">
            <span>ISO 27001 Certified Security</span>
            <span>WCAG 2.1 AA Compliant</span>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
