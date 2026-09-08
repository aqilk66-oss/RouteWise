import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Elegant 3D Transportation Road & Route Path
 * 
 * Features:
 * - Smooth dark asphalt surface with clean low-profile cross-section
 * - Subtle slate-tinted curb boundaries
 * - Elegant glowing RouteWise tracking line (Professional Blue / Teal accent)
 * - Restrained waypoints without excessive flashing or clutter
 */
export const RoutePath = ({ curve, busProgress = 0 }) => {
  // Road asphalt surface along the curve (tubular geometry with flat perspective)
  const roadGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 120, 0.85, 8, true);
  }, [curve]);

  // Subtle outer curb margins
  const curbsGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 120, 0.90, 4, true);
  }, [curve]);

  // Elegant slim neon telemetry guide line (Teal/Blue)
  const beamGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 140, 0.024, 6, true);
  }, [curve]);

  return (
    <group>
      {/* Matte Dark Asphalt Road Surface */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <primitive object={roadGeometry} />
        <meshStandardMaterial
          color="#0F172A"
          roughness={0.78}
          metalness={0.15}
        />
      </mesh>

      {/* Subtle Outer Curbs */}
      <mesh position={[0, 0.005, 0]}>
        <primitive object={curbsGeometry} />
        <meshStandardMaterial color="#334155" roughness={0.85} />
      </mesh>

      {/* Clean Technological Route Glow Beam (Professional Blue / Teal) */}
      <mesh position={[0, 0.035, 0]}>
        <primitive object={beamGeometry} />
        <meshStandardMaterial 
          color="#14B8A6" 
          emissive="#0EA5E9" 
          emissiveIntensity={0.85} 
        />
      </mesh>

      {/* 2 Restrained Intermediate Waypoint Nodes */}
      {[0.25, 0.72].map((t, idx) => {
        const pt = curve.getPointAt(t);
        return (
          <group key={idx} position={[pt.x, pt.y + 0.04, pt.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.08, 0.16, 24]} />
              <meshBasicMaterial 
                color="#0EA5E9" 
                transparent 
                opacity={0.45} 
                side={THREE.DoubleSide} 
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default RoutePath;
