import React from 'react';

/**
 * Atmospheric background layers: Subtle navy/blue radial glow, faint transit route motif, and tech grid
 */
export const HeroBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {/* High-End Enterprise Ambient Glow Spheres */}
      <div className="absolute -top-40 left-1/4 w-[750px] h-[750px] bg-gradient-to-br from-brand-blue/12 to-brand-teal/8 rounded-full blur-[140px]" />
      <div className="absolute top-1/4 -right-32 w-[650px] h-[650px] bg-gradient-to-bl from-blue-400/10 via-brand-teal/10 to-transparent rounded-full blur-[130px]" />
      <div className="absolute -bottom-24 left-10 w-[550px] h-[550px] bg-brand-navy/6 rounded-full blur-[100px]" />

      {/* Modern SVG Glowing Transit Route Corridors */}
      <svg
        className="absolute inset-0 w-full h-full opacity-40"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
      >
        <defs>
          <linearGradient id="heroRouteGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="heroRouteGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.05" />
            <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path
          d="M-100 180 C 320 120, 640 320, 1050 190 S 1450 360, 1920 220"
          stroke="url(#heroRouteGrad1)"
          strokeWidth="2"
          strokeDasharray="8 10"
        />
        <path
          d="M-80 430 C 260 360, 720 490, 1180 390 S 1540 520, 2000 350"
          stroke="url(#heroRouteGrad2)"
          strokeWidth="1.8"
          strokeDasharray="6 8"
        />
      </svg>

      {/* Fine Isometric Background Grid & Vignette */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 mask-radial" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/70" />
    </div>
  );
};

export default HeroBackground;
