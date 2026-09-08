import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SchoolBus from './SchoolBus';
import RoutePath from './RoutePath';
import GPSMarker from './GPSMarker';
import SchoolEnvironment from './SchoolEnvironment';
import SceneLighting from './SceneLighting';

/**
 * RouteWise 3D Scene Controller
 * 
 * Composition & Camera Alignment:
 * - Bus sits on the lower-right/middle-right axis (3/4 perspective view).
 * - Smooth motion along transit spline with gentle realistic suspension damping.
 * - Minimalist environment: 1 stylized campus terminal, 2 trees, 3 waypoint pins.
 * - Clean ground disc with subtle technology ring.
 * - Desktop pointer tilt with safe damping; disabled on mobile or reduced motion.
 */
export const RouteWiseScene = ({ pointerRef, isMobile = false }) => {
  const sceneGroup = useRef();
  const busRef = useRef();
  const progressRef = useRef(0.2); // Start bus on prominent front stretch
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Smooth transit curve leading the eye toward the center-right focal area
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3.8, 0.04, 0.8),
      new THREE.Vector3(-1.8, 0.04, 2.6),
      new THREE.Vector3(1.2, 0.04, 2.5),
      new THREE.Vector3(3.6, 0.04, 0.8),
      new THREE.Vector3(3.2, 0.04, -1.6),
      new THREE.Vector3(0.4, 0.04, -2.4),
      new THREE.Vector3(-2.6, 0.04, -1.8),
      new THREE.Vector3(-4.0, 0.04, -0.6),
    ], true);
  }, []);

  useFrame((state, delta) => {
    if (reducedMotionRef.current || !curve) return;

    try {
      const safeDelta = Math.min(delta || 0.016, 0.05);
      // Gentle, controlled vehicle traversal
      progressRef.current = (progressRef.current + safeDelta * 0.038) % 1;

      // Evaluate position and directional tangent
      const point = curve.getPointAt(progressRef.current);
      const tangent = curve.getTangentAt(progressRef.current);

      if (busRef.current && point && tangent) {
        // Subtle suspension vertical breathing
        const suspensionBounce = Math.sin(state.clock.elapsedTime * 2.2) * 0.008;
        busRef.current.position.set(point.x, (point.y || 0) + 0.08 + suspensionBounce, point.z);

        const angle = Math.atan2(tangent.x, tangent.z);
        if (!isNaN(angle)) {
          busRef.current.rotation.set(0, angle, 0);
        }
      }

      // Restrained desktop pointer parallax (damping = 0.04)
      if (!isMobile && sceneGroup.current && pointerRef?.current) {
        const px = pointerRef.current.x || 0;
        const py = pointerRef.current.y || 0;
        const targetRotY = px * 0.06;
        const targetRotX = -py * 0.04;

        sceneGroup.current.rotation.y = THREE.MathUtils.lerp(sceneGroup.current.rotation.y, targetRotY, 0.04);
        sceneGroup.current.rotation.x = THREE.MathUtils.lerp(sceneGroup.current.rotation.x, targetRotX, 0.04);
      }
    } catch (e) {
      // Non-fatal frame calculation guard
    }
  });

  return (
    <group ref={sceneGroup} position={[0.2, -0.5, 0]} rotation={[0.24, -0.28, 0]}>
      <SceneLighting />

      {/* Clean Studio Platform / Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]} receiveShadow>
        <circleGeometry args={[6.4, 48]} />
        <meshStandardMaterial
          color="#F8FAFC"
          roughness={0.92}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Subtle Technology Perimeter Halo */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.035, 0]}>
        <ringGeometry args={[6.32, 6.42, 64]} />
        <meshBasicMaterial color="#2563EB" transparent opacity={0.22} />
      </mesh>

      {/* Clean Road Network & Glowing Routing Line */}
      <RoutePath curve={curve} busProgress={progressRef.current} />

      {/* Refined School Bus Model */}
      <SchoolBus ref={busRef} position={[0, 0.08, 0]} scale={[0.82, 0.82, 0.82]} />

      {/* 3 Meaningful GPS Route Markers: School, Stop 1, Stop 2 */}
      <GPSMarker position={[-1.8, 0, 2.6]} label="Stop 1" color="#2563EB" emissive="#0EA5E9" />
      <GPSMarker position={[3.6, 0, 0.8]} label="Stop 2" color="#14B8A6" emissive="#14B8A6" />
      <GPSMarker position={[3.6, 0, -2.4]} label="School Campus" color="#183B56" emissive="#2563EB" />

      {/* Restrained School Campus Reference */}
      <SchoolEnvironment />
    </group>
  );
};

export default RouteWiseScene;
