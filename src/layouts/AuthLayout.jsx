import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Shell for Authentication screens (Login, Register, Forgot Password)
 */
export const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background spatial blur */}
      <div className="absolute top-0 -left-40 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-white p-1 border border-brand-blue/20 shadow-soft group-hover:scale-105 transition-transform flex items-center justify-center">
            <img src="/assets/logo.png" alt="RouteWise Logo" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-black text-brand-navy tracking-tight">RouteWise</span>
        </Link>
        {title && <h2 className="text-2xl font-bold text-brand-navy tracking-tight">{title}</h2>}
        {subtitle && <p className="mt-2 text-sm text-brand-slate">{subtitle}</p>}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-floating rounded-2xl border border-border">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
