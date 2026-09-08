import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Minimalist 3D GPS Waypoint Marker
 * - Clean vertical pin with understated hovering motion
 * - Subtle ground pulse ring with controlled opacity
 * - Professional Blue & Teal color accents
 */
export const GPSMarker = ({
  position = [0, 0, 0],
  label = 'Stop',
  color = '#2563EB',
  emissive = '#0EA5E9'
}) => {
  const markerGroup = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (markerGroup.current) {
      // Very gentle hovering motion (reduced amplitude)
      markerGroup.current.position.y = position[1] + 0.35 + Math.sin(time * 1.8) * 0.04;
    }
    if (ringRef.current) {
      // Soft fading ground radar pulse
      const pulse = (Math.sin(time * 1.8) + 1) * 0.5;
      const scale = 1.0 + pulse * 0.25;
      ringRef.current.scale.set(scale, scale, scale);
      ringRef.current.material.opacity = 0.45 - pulse * 0.2;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Ground Pulse Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.22, 0.32, 28]} />
        <meshBasicMaterial color={emissive} transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Modern Tech Pin */}
      <group ref={markerGroup} position={[0, position[1] + 0.35, 0]}>
        {/* Beacon Sphere */}
        <mesh position={[0, 0.32, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} roughness={0.3} />
        </mesh>
        
        {/* Needle Stem */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.24, 8]} />
          <meshStandardMaterial color="#94A3B8" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Center Tech Core Dot */}
        <mesh position={[0, 0.32, 0.12]}>
          <sphereGeometry args={[0.04, 10, 10]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
    </group>
  );
};

export default GPSMarker;
