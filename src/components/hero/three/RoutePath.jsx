import React, { useMemo } from 'react';
import * as THREE from 'three';

/**
 * 3D Route Path and Road Network
 * Renders smooth asphalt road, white dashed lane markings, and an animated RouteWise tracking line.
 */
export const RoutePath = ({ curve, busProgress = 0 }) => {
  // Generate points along the curved transit corridor
  const points = useMemo(() => curve.getPoints(120), [curve]);
  
  // Road plane geometry along curve
  const roadGeometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 100, 0.95, 8, true);
  }, [curve]);

  // Route telemetry glow line (Teal/Blue)
  const lineGeometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <group>
      {/* Asphalt Road Surface */}
      <mesh position={[0, -0.02, 0]} receiveShadow>
        <primitive object={roadGeometry} />
        <meshStandardMaterial
          color="#0F172A"
          roughness={0.7}
          metalness={0.2}
          wireframe={false}
        />
      </mesh>

      {/* Outer Road Edge Curbs (Subtle Slate borders) */}
      <mesh position={[0, 0.01, 0]}>
        <primitive object={new THREE.TubeGeometry(curve, 120, 1.02, 4, true)} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>

      {/* Real-time Tracking Glowing Route Line (Neon Cyan Highway Beam) */}
      <mesh position={[0, 0.04, 0]}>
        <primitive object={new THREE.TubeGeometry(curve, 140, 0.035, 6, true)} />
        <meshStandardMaterial color="#14B8A6" emissive="#14B8A6" emissiveIntensity={1.2} />
      </mesh>

      {/* Pulse Nodes along Key Waypoints */}
      {[0.15, 0.45, 0.75].map((t, idx) => {
        const pt = curve.getPointAt(t);
        return (
          <group key={idx} position={[pt.x, pt.y + 0.1, pt.z]}>
            <mesh>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial color="#2563EB" emissive="#2563EB" emissiveIntensity={0.8} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.15, 0.25, 24]} />
              <meshBasicMaterial color="#14B8A6" transparent opacity={0.6} side={THREE.DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default RoutePath;
