import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import RouteWiseScene from './three/RouteWiseScene';
import HeroTelemetryPanels from './HeroTelemetryPanels';
import { Bus, Loader2 } from 'lucide-react';

/**
 * 3D Canvas wrapper supporting async suspense, WebGL error boundary fallback,
 * intersection observer visibility pause, and pointer tracking.
 */
export const Hero3DViewer = ({ telemetry }) => {
  const containerRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);

  useEffect(() => {
    // Check viewport width for mobile tier optimization
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Pause WebGL rendering loop when scrolled off-screen
    let observer;
    if (containerRef.current && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsInViewport(entry.isIntersecting);
        },
        { threshold: 0.05 }
      );
      observer.observe(containerRef.current);
    }

    // Pointer movement tracking for desktop parallax
    const handlePointerMove = (e) => {
      if (!containerRef.current || isMobile) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('pointermove', handlePointerMove);
      if (observer) observer.disconnect();
    };
  }, [isMobile]);

  // Fallback if WebGL fails or crashes
  if (hasWebGLError) {
    return (
      <div className="w-full h-full min-h-[380px] sm:min-h-[460px] lg:min-h-[540px] rounded-3xl bg-slate-100/80 border border-border flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center text-brand-blue mb-4">
          <Bus className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-brand-navy mb-1">RouteWise Interactive Network</h4>
        <p className="text-xs text-brand-slate max-w-sm mb-4">
          Interactive 3D mode fell back to 2D vector mode for optimum hardware efficiency.
        </p>
        <HeroTelemetryPanels telemetry={telemetry} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="hero-3d-container w-full h-[400px] sm:h-[480px] lg:h-[560px] 2xl:h-[620px] rounded-3xl relative overflow-hidden select-none"
    >
      {/* Background spatial glow behind 3D canvas */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-blue/8 to-transparent pointer-events-none rounded-3xl" />

      {/* Floating telemetry UI overlays */}
      <HeroTelemetryPanels telemetry={telemetry} />

      {/* Three.js Canvas with Suspense fallback and viewport framing optimization */}
      <Suspense
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50/50 backdrop-blur-sm rounded-3xl">
            <Loader2 className="w-8 h-8 text-brand-blue animate-spin mb-3" />
            <span className="text-xs font-semibold text-brand-navy tracking-wide">
              Initializing RouteWise Transport Network...
            </span>
          </div>
        }
      >
        <Canvas
          frameloop={isInViewport ? 'always' : 'never'}
          camera={{ position: [0, 4.8, 8.2], fov: 38, near: 0.1, far: 50 }}
          dpr={isMobile ? [1, 1.5] : [1, 2]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: 3, // ACESFilmicToneMapping
            toneMappingExposure: 1.15,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
          }}
          onError={() => setHasWebGLError(true)}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <RouteWiseScene pointerRef={pointerRef} isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default Hero3DViewer;
