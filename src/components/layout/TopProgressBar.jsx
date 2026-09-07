import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * TopProgressBar Component
 * Renders a slim, vibrant neon-cyan/brand-blue loading line at the very top of the viewport
 * whenever the user navigates between pages or switches routes in the MPA.
 */
export const TopProgressBar = () => {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Scroll window to top smoothly on new route navigation
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Start progress bar on route change
    setVisible(true);
    setProgress(20);

    const timer1 = setTimeout(() => {
      setProgress(65);
    }, 80);

    const timer2 = setTimeout(() => {
      setProgress(100);
    }, 220);

    const timer3 = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 450);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none h-[3px] bg-transparent overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div
        className="h-full bg-gradient-to-r from-brand-blue via-brand-teal to-sky-400 shadow-[0_0_8px_rgba(20,184,166,0.8)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transitionProperty: 'width, opacity',
          transitionDuration: progress === 100 ? '250ms' : '150ms',
        }}
      />
    </div>
  );
};

export default TopProgressBar;
