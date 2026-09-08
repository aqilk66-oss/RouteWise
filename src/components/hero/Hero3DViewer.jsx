import React, { Suspense, useEffect, useRef, useState, Component } from 'react';
import { Canvas } from '@react-three/fiber';
import RouteWiseScene from './three/RouteWiseScene';
import HeroTelemetryPanels from './HeroTelemetryPanels';
import { Bus, Loader2, Navigation, Compass, Shield } from 'lucide-react';

/**
 * Isolated Canvas Error Boundary preventing 3D/WebGL faults from bubbling
 */
class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

/**
 * Premium Static Vector Illustration Fallback
 * Seamlessly matches the 3D scene's dimensions, palette, and composition
 * without causing layout shifts when WebGL is unavailable or on low-power devices.
 */
const StaticVectorFallback = ({ telemetry }) => {
  return (
    <div 
      className="w-full h-full rounded-3xl bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/20 border border-border/80 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden select-none shadow-soft"
      role="img"
      aria-label="RouteWise School Transport and Live Bus Tracking Visualization"
    >
      {/* Background Architectural Vector Grid & Route Path */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-40 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#14B8A6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {/* Curving Transit Arc */}
        <path 
          d="M 50,320 C 180,420 320,380 440,240 C 520,140 380,80 260,110 C 160,140 180,260 300,280" 
          fill="none" 
          stroke="url(#routeGradient)" 
          strokeWidth="6" 
          strokeDasharray="8 8"
        />
        {/* Center Ground Halo */}
        <ellipse cx="60%" cy="58%" rx="180" ry="85" fill="#2563EB" fillOpacity="0.04" />
      </svg>

      {/* Central Visual Icon & Bus Silhouette */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-20 h-20 rounded-2xl bg-white shadow-floating border border-brand-blue/15 flex items-center justify-center text-amber-500 mb-4 transition-transform hover:scale-105">
          <Bus className="w-10 h-10 stroke-[1.75]" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-brand-blue/20 text-brand-blue text-[11px] font-semibold mb-2 shadow-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>ROUTEWISE NETWORK ACTIVE</span>
        </div>
        <h4 className="text-base font-bold text-brand-navy mb-1 tracking-tight">
          Smart School Bus Telematics
        </h4>
        <p className="text-xs text-brand-slate max-w-sm leading-relaxed mb-4">
          Real-time route corridors, geofence arrival alerts, and student transit safety.
        </p>
      </div>

      {/* Floating Telemetry Panels */}
      <HeroTelemetryPanels telemetry={telemetry} />
    </div>
  );
};

/**
 * Hero3DViewer Component (also exported as Bus3DCanvas for backward compatibility)
 * 
 * Performance & Rendering Features:
 * - Automatically evaluates WebGL availability and hardware tiers (Mobile / Tablet / Desktop)
 * - Restrained 3/4 cinematic camera angle: [0, 4.4, 7.8], fov: 36
 * - Pauses WebGL render loop when scrolled out of viewport (IntersectionObserver)
 * - Safe error boundary switching to StaticVectorFallback with zero layout shift
 */
export const Hero3DViewer = ({ telemetry }) => {
  const containerRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInViewport, setIsInViewport] = useState(true);

  useEffect(() => {
    // Check if WebGL is supported
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGLError(true);
      }
    } catch (e) {
      setHasWebGLError(true);
    }

    // Viewport width listener for tier optimization
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);

    // Pause render loop when scrolled off-screen
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

    // Desktop pointer movement tracking for gentle parallax
    const handlePointerMove = (e) => {
      if (!containerRef.current || isMobile) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      pointerRef.current = { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => {
      window.removeEventListener('resize', checkViewport);
      window.removeEventListener('pointermove', handlePointerMove);
      if (observer) observer.disconnect();
    };
  }, [isMobile]);

  // Fallback if WebGL fails or crashes
  if (hasWebGLError) {
    return (
      <div 
        ref={containerRef}
        className="hero-3d-container w-full h-[380px] sm:h-[460px] lg:h-[540px] 2xl:h-[580px] rounded-3xl relative overflow-hidden select-none"
      >
        <StaticVectorFallback telemetry={telemetry} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="hero-3d-container w-full h-[380px] sm:h-[460px] lg:h-[540px] 2xl:h-[580px] rounded-3xl relative overflow-hidden select-none"
    >
      {/* Background spatial glow behind 3D canvas */}
      <div className="absolute inset-0 bg-radial-gradient from-brand-blue/6 to-transparent pointer-events-none rounded-3xl" />

      {/* Floating telemetry UI overlays */}
      <HeroTelemetryPanels telemetry={telemetry} />

      {/* Three.js Canvas with Suspense fallback and viewport framing optimization */}
      <CanvasErrorBoundary
        onError={(err) => {
          console.warn('WebGL/Three.js render exception intercepted gracefully:', err);
          setHasWebGLError(true);
        }}
        fallback={<StaticVectorFallback telemetry={telemetry} />}
      >
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
            camera={{ position: [0, 4.4, 7.8], fov: 36, near: 0.1, far: 45 }}
            dpr={isMobile ? [1, 1.25] : [1, 1.75]}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
              toneMapping: 3, // ACESFilmicToneMapping
              toneMappingExposure: 1.12,
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
      </CanvasErrorBoundary>
    </div>
  );
};

// Aliased export for compatibility with any existing or external references
export const Bus3DCanvas = Hero3DViewer;

export default Hero3DViewer;
