import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SchoolBus from './SchoolBus';
import RoutePath from './RoutePath';
import GPSMarker from './GPSMarker';
import SchoolEnvironment from './SchoolEnvironment';
import SceneLighting from './SceneLighting';

/**
 * Main 3D Scene Controller
 * Smoothly interpolates bus along a curved transportation spline, orients heading, and handles pointer parallax.
 * Uses direct Three.js object mutations in useFrame to achieve 60/120fps without React re-render overhead.
 * Respects prefers-reduced-motion.
 */
export const RouteWiseScene = ({ pointerRef, isMobile = false }) => {
  const sceneGroup = useRef();
  const busRef = useRef();
  const progressRef = useRef(0);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Define realistic closed transit circuit curve
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-4.5, 0.05, 1.2),
      new THREE.Vector3(-2.2, 0.05, 3.2),
      new THREE.Vector3(1.5, 0.05, 3.0),
      new THREE.Vector3(4.0, 0.05, 1.0),
      new THREE.Vector3(3.5, 0.05, -1.8),
      new THREE.Vector3(0.5, 0.05, -2.8),
      new THREE.Vector3(-3.0, 0.05, -2.2),
      new THREE.Vector3(-4.8, 0.05, -0.5),
    ], true);
  }, []);

  useFrame((state, delta) => {
    if (reducedMotionRef.current) return;

    // Increment bus progress along route loop smoothly
    progressRef.current = (progressRef.current + delta * 0.065) % 1;

    // Calculate current point and tangent for realistic vehicle heading
    const point = curve.getPointAt(progressRef.current);
    const tangent = curve.getTangentAt(progressRef.current);

    // Direct object transformation bypasses React reconciliation
    if (busRef.current) {
      busRef.current.position.set(point.x, point.y + 0.1, point.z);
      const angle = Math.atan2(tangent.x, tangent.z);
      busRef.current.rotation.set(0, angle, 0);
    }

    // Subtle pointer parallax tilt on desktop
    if (!isMobile && sceneGroup.current && pointerRef?.current) {
      const targetRotY = pointerRef.current.x * 0.12;
      const targetRotX = -pointerRef.current.y * 0.08;

      sceneGroup.current.rotation.y = THREE.MathUtils.lerp(sceneGroup.current.rotation.y, targetRotY, 0.05);
      sceneGroup.current.rotation.x = THREE.MathUtils.lerp(sceneGroup.current.rotation.x, targetRotX, 0.05);
    }
  });

  return (
    <group ref={sceneGroup} position={[0, -0.6, 0]} rotation={[0.22, -0.35, 0]}>
      <SceneLighting />

      {/* Ground Grid / Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[7.5, 48]} />
        <meshStandardMaterial
          color="#F8FAFC"
          roughness={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Surrounding Ambient Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
        <ringGeometry args={[7.4, 7.55, 64]} />
        <meshBasicMaterial color="#2563EB" transparent opacity={0.35} />
      </mesh>

      {/* Road Network & Trajectory Line */}
      <RoutePath curve={curve} busProgress={progressRef.current} />

      {/* School Bus traveling on the trajectory */}
      <SchoolBus ref={busRef} position={[0, 0.1, 0]} rotation={[0, 0, 0]} />

      {/* GPS Waypoint Markers */}
      <GPSMarker position={[-2.2, 0, 3.2]} label="Stop 1" color="#2563EB" emissive="#38BDF8" />
      <GPSMarker position={[4.0, 0, 1.0]} label="Stop 2" color="#14B8A6" emissive="#14B8A6" />
      <GPSMarker position={[3.2, 0, -2.8]} label="School" color="#183B56" emissive="#2563EB" />

      {/* Stylized School Campus Environment */}
      <SchoolEnvironment />
    </group>
  );
};

export default RouteWiseScene;
