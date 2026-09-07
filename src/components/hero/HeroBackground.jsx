import React from 'react';

/**
 * Atmospheric background layers: Subtle navy/blue radial glow, faint transit route motif, and tech grid
 */
export const HeroBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* Primary Atmospheric Glows */}
      <div className="absolute -top-32 left-1/4 w-[700px] h-[700px] bg-brand-blue/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/3 -right-32 w-[600px] h-[600px] bg-brand-teal/10 rounded-full blur-[100px]" />
      <div className="absolute -bottom-20 left-10 w-[500px] h-[500px] bg-brand-navy/5 rounded-full blur-[90px]" />

      {/* Subtle SVG Transit Route-Line Motif */}
      <svg
        className="absolute inset-0 w-full h-full opacity-30 stroke-brand-slate/20"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <path
          d="M-100 200 C 300 150, 600 350, 1000 220 S 1400 400, 1800 250"
          strokeWidth="1.5"
          strokeDasharray="6 8"
        />
        <path
          d="M-50 450 C 250 380, 700 520, 1150 420 S 1500 550, 1950 380"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
      </svg>

      {/* Fine Background Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40" />
    </div>
  );
};

export default HeroBackground;
