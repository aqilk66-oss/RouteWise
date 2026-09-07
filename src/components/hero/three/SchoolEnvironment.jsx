import React from 'react';

/**
 * Procedural stylized school building & transit depot environment
 * Simple, elegant geometric architecture establishing school transportation context.
 */
export const SchoolEnvironment = () => {
  return (
    <group position={[3.2, 0, -2.8]}>
      {/* School Main Hall */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.6, 2.2, 1.8]} />
        <meshStandardMaterial color="#1E293B" roughness={0.7} />
      </mesh>

      {/* School Gabled Roof / Pediment */}
      <mesh position={[0, 2.35, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[1.7, 0.7, 4]} />
        <meshStandardMaterial color="#2563EB" roughness={0.4} />
      </mesh>

      {/* Clock Tower / Bell Cupola */}
      <mesh position={[0, 2.9, 0]}>
        <boxGeometry args={[0.5, 0.8, 0.5]} />
        <meshStandardMaterial color="#0F172A" />
      </mesh>
      <mesh position={[0, 3.45, 0]}>
        <coneGeometry args={[0.35, 0.5, 4]} />
        <meshStandardMaterial color="#14B8A6" />
      </mesh>

      {/* School Entrance Columns & Canopy */}
      <mesh position={[0, 0.45, 1.05]}>
        <boxGeometry args={[1.4, 0.9, 0.35]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.5} />
      </mesh>

      {/* Classroom Windows Rows */}
      {[-0.8, 0.8].map((xOffset) => (
        <mesh key={xOffset} position={[xOffset, 1.2, 0.91]}>
          <planeGeometry args={[0.7, 0.8]} />
          <meshStandardMaterial color="#38BDF8" transparent opacity={0.75} roughness={0.1} />
        </mesh>
      ))}

      {/* Campus Greenery / Modern Low-Poly Trees */}
      {[
        [-1.8, 0, 0.8],
        [1.8, 0, 0.8],
        [-1.6, 0, -1.2],
      ].map((treePos, i) => (
        <group key={i} position={treePos}>
          {/* Trunk */}
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.6, 8]} />
            <meshStandardMaterial color="#78350F" roughness={0.9} />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 0.85, 0]}>
            <coneGeometry args={[0.45, 0.8, 6]} />
            <meshStandardMaterial color="#10B981" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.25, 0]}>
            <coneGeometry args={[0.35, 0.6, 6]} />
            <meshStandardMaterial color="#059669" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Bus Stop Shelter Canopy */}
      <group position={[-2.4, 0, 2.2]}>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[1.2, 0.05, 0.8]} />
          <meshStandardMaterial color="#2563EB" transparent opacity={0.8} />
        </mesh>
        <mesh position={[-0.5, 0.35, -0.3]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        <mesh position={[0.5, 0.35, -0.3]}>
          <cylinderGeometry args={[0.03, 0.03, 0.7]} />
          <meshStandardMaterial color="#94A3B8" />
        </mesh>
        {/* Bench */}
        <mesh position={[0, 0.2, -0.2]}>
          <boxGeometry args={[0.9, 0.1, 0.25]} />
          <meshStandardMaterial color="#64748B" />
        </mesh>
      </group>
    </group>
  );
};

export default SchoolEnvironment;
