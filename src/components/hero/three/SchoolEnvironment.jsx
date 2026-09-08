import React from 'react';

/**
 * Clean, Restrained School Transportation Reference
 * 
 * Minimalist geometric terminal canopy and contemporary architectural accents:
 * - 1 clean, low-profile transit portal terminal (deep navy & slate)
 * - 2 minimal stylized architectural trees (restrained scale)
 * - Clear of clutter; does not compete with the bus focal point or hero copy.
 */
export const SchoolEnvironment = () => {
  return (
    <group position={[3.6, 0, -2.4]}>
      {/* --- Modern Low-Profile Campus Terminal Hub --- */}
      {/* Main Terminal Pavilion */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 1.4, 1.2]} />
        <meshStandardMaterial color="#1E293B" roughness={0.65} metalness={0.15} />
      </mesh>

      {/* Architectural Roof Overhang / Solar Trim */}
      <mesh position={[0, 1.44, 0]}>
        <boxGeometry args={[2.1, 0.08, 1.4]} />
        <meshStandardMaterial color="#2563EB" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Campus Terminal Glass Entrance Bay */}
      <mesh position={[0, 0.45, 0.62]}>
        <boxGeometry args={[1.2, 0.85, 0.06]} />
        <meshPhysicalMaterial 
          color="#38BDF8" 
          transparent 
          opacity={0.65} 
          roughness={0.1} 
          metalness={0.2} 
        />
      </mesh>

      {/* Minimal Brand Accent Bar */}
      <mesh position={[0, 0.92, 0.63]}>
        <boxGeometry args={[1.0, 0.04, 0.02]} />
        <meshStandardMaterial color="#14B8A6" emissive="#14B8A6" emissiveIntensity={0.6} />
      </mesh>

      {/* --- Two Restrained Architectural Campus Trees --- */}
      {/* Tree 1: Flanking left */}
      <group position={[-1.4, 0, 0.5]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.05, 0.07, 0.7, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <coneGeometry args={[0.32, 0.75, 8]} />
          <meshStandardMaterial color="#0D9488" roughness={0.55} />
        </mesh>
      </group>

      {/* Tree 2: Flanking right */}
      <group position={[1.4, 0, -0.4]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.6, 8]} />
          <meshStandardMaterial color="#475569" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.8, 0]}>
          <coneGeometry args={[0.28, 0.65, 8]} />
          <meshStandardMaterial color="#0F766E" roughness={0.55} />
        </mesh>
      </group>
    </group>
  );
};

export default SchoolEnvironment;
