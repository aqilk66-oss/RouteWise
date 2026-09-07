import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

/**
 * Shell for Public Pages (Landing, About, Features, Contact)
 */
export const PublicLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-brand-navy selection:bg-brand-blue/15 selection:text-brand-navy">
      <Navbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PublicLayout;
