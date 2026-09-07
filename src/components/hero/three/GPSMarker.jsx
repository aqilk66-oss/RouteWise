import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * 3D GPS Location Pin with gentle hover animation and pulsing beacon ring
 */
export const GPSMarker = ({
  position = [0, 0, 0],
  label = 'Bus Stop',
  color = '#2563EB',
  emissive = '#14B8A6'
}) => {
  const markerGroup = useRef();
  const ringRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (markerGroup.current) {
      // Gentle floating hover motion
      markerGroup.current.position.y = position[1] + Math.sin(time * 2.5) * 0.08;
    }
    if (ringRef.current) {
      // Expand and fade ring beacon
      const scale = 1 + (Math.sin(time * 2) + 1) * 0.35;
      ringRef.current.scale.set(scale, scale, scale);
      ringRef.current.material.opacity = 0.6 - (Math.sin(time * 2) + 1) * 0.2;
    }
  });

  return (
    <group position={[position[0], 0, position[2]]}>
      {/* Ground Pulse Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.3, 0.45, 32]} />
        <meshBasicMaterial color={emissive} transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>

      {/* Floating Pin & Sphere */}
      <group ref={markerGroup} position={[0, position[1] + 0.4, 0]}>
        {/* Glowing Head */}
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.22, 20, 20]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.2} />
        </mesh>
        
        {/* Pointer Cone */}
        <mesh position={[0, 0.22, 0]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.18, 0.4, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>

        {/* Core Center White Accent */}
        <mesh position={[0, 0.5, 0.16]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
    </group>
  );
};

export default GPSMarker;
