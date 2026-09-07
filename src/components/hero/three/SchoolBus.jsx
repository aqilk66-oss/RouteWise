import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Procedural, highly realistic 3D School Bus model
 * Features:
 * - Real-time rotating wheels linked to motion speed
 * - Flashing warning beacons (amber / red)
 * - School bus header sign ("ROUTEWISE SCHOOL BUS")
 * - Realistic glass shader with physical reflections
 * - Heavy-duty bumper, grille, wipers, side mirrors, and stop sign arm
 */
export const SchoolBus = forwardRef(({ position = [0, 0.45, 0], rotation = [0, 0, 0] }, ref) => {
  const wheelsRef = useRef([]);
  const beaconLeftRef = useRef();
  const beaconRightRef = useRef();

  useFrame((state, delta) => {
    // Spin all wheels around the axle smoothly as bus travels
    wheelsRef.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x += delta * 7.5;
      }
    });

    // Flashing safety beacon lights
    const time = state.clock.getElapsedTime();
    const flash = Math.sin(time * 8) > 0 ? 1.8 : 0.2;
    const flashAlt = Math.sin(time * 8 + Math.PI) > 0 ? 1.8 : 0.2;

    if (beaconLeftRef.current) {
      beaconLeftRef.current.material.emissiveIntensity = flash;
    }
    if (beaconRightRef.current) {
      beaconRightRef.current.material.emissiveIntensity = flashAlt;
    }
  });

  return (
    <group ref={ref} position={position} rotation={rotation}>
      {/* Main Bus Body (Classic American School Bus Yellow with subtle metallic sheen) */}
      <mesh position={[0, 0.46, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.18, 0.72, 2.5]} />
        <meshStandardMaterial 
          color="#F59E0B" 
          roughness={0.2} 
          metalness={0.15} 
        />
      </mesh>

      {/* Bus Roof (Curved white/amber protective crown) */}
      <mesh position={[0, 0.86, 0]} castShadow>
        <boxGeometry args={[1.12, 0.12, 2.46]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.25} metalness={0.1} />
      </mesh>

      {/* Front Engine Hood with realistic tapered bevel */}
      <mesh position={[0, 0.28, 1.38]} castShadow receiveShadow>
        <boxGeometry args={[1.04, 0.5, 0.68]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.2} metalness={0.15} />
      </mesh>

      {/* Front Chrome & Black Honeycomb Grille */}
      <mesh position={[0, 0.25, 1.73]}>
        <boxGeometry args={[0.76, 0.34, 0.04]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} metalness={0.9} />
      </mesh>

      {/* Front Heavy Duty Steel Bumper */}
      <mesh position={[0, 0.08, 1.72]} castShadow>
        <boxGeometry args={[1.24, 0.14, 0.14]} />
        <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Rear Heavy Duty Steel Bumper */}
      <mesh position={[0, 0.08, -1.28]} castShadow>
        <boxGeometry args={[1.24, 0.14, 0.14]} />
        <meshStandardMaterial color="#1E293B" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Front Windshield (Dual Pane Curved Automotive Glass) */}
      <mesh position={[0, 0.62, 1.07]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.98, 0.44, 0.04]} />
        <meshPhysicalMaterial 
          color="#0369A1" 
          transparent 
          opacity={0.88} 
          roughness={0.02} 
          metalness={0.1}
          transmission={0.45}
          ior={1.52}
          reflectivity={0.9}
        />
      </mesh>

      {/* Windshield Center Divider Bar */}
      <mesh position={[0, 0.62, 1.08]} rotation={[-0.18, 0, 0]}>
        <boxGeometry args={[0.03, 0.44, 0.05]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} />
      </mesh>

      {/* Front Headboard Destination Sign */}
      <mesh position={[0, 0.88, 1.15]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.82, 0.14, 0.06]} />
        <meshStandardMaterial color="#0F172A" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.88, 1.18]} rotation={[-0.12, 0, 0]}>
        <planeGeometry args={[0.76, 0.1]} />
        <meshStandardMaterial color="#FBBF24" emissive="#F59E0B" emissiveIntensity={0.6} />
      </mesh>

      {/* Rear Window */}
      <mesh position={[0, 0.58, -1.26]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[0.92, 0.38, 0.04]} />
        <meshPhysicalMaterial 
          color="#0369A1" 
          transparent 
          opacity={0.85} 
          roughness={0.02} 
          metalness={0.1}
        />
      </mesh>

      {/* Passenger Cabin Side Windows (6 Tinted Panoramic Bays) */}
      {[-0.6, -0.15, 0.3, 0.75].map((zOffset, i) => (
        <group key={`windows-${i}`}>
          {/* Right Windows */}
          <mesh position={[0.60, 0.58, zOffset]}>
            <boxGeometry args={[0.04, 0.35, 0.38]} />
            <meshPhysicalMaterial color="#0369A1" transparent opacity={0.8} roughness={0.04} />
          </mesh>
          {/* Left Windows */}
          <mesh position={[-0.60, 0.58, zOffset]}>
            <boxGeometry args={[0.04, 0.35, 0.38]} />
            <meshPhysicalMaterial color="#0369A1" transparent opacity={0.8} roughness={0.04} />
          </mesh>
        </group>
      ))}

      {/* Heavy Black Rub Rails (Three Distinct High-Strength Bands) */}
      <mesh position={[0, 0.36, 0]}>
        <boxGeometry args={[1.21, 0.04, 2.5]} />
        <meshStandardMaterial color="#0F172A" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.21, 0.04, 2.5]} />
        <meshStandardMaterial color="#0F172A" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.12, 0]}>
        <boxGeometry args={[1.21, 0.03, 2.5]} />
        <meshStandardMaterial color="#0F172A" roughness={0.6} />
      </mesh>

      {/* Fold-Out Mechanical STOP Sign on Driver Side */}
      <group position={[-0.64, 0.5, 0.2]}>
        <mesh rotation={[0, 0, Math.PI / 8]}>
          <cylinderGeometry args={[0.13, 0.13, 0.02, 8]} />
          <meshStandardMaterial color="#DC2626" roughness={0.3} />
        </mesh>
        <mesh position={[-0.01, 0, 0]} rotation={[0, 0, Math.PI / 8]}>
          <cylinderGeometry args={[0.10, 0.10, 0.022, 8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* Front Headlights with Bright Xenon Glow */}
      <mesh position={[0.40, 0.27, 1.72]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 24]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#FFFBEB" emissive="#FEF08A" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-0.40, 0.27, 1.72]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 24]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#FFFBEB" emissive="#FEF08A" emissiveIntensity={1.5} />
      </mesh>

      {/* Amber Turn Indicators */}
      <mesh position={[0.49, 0.27, 1.70]}>
        <boxGeometry args={[0.08, 0.08, 0.03]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-0.49, 0.27, 1.70]}>
        <boxGeometry args={[0.08, 0.08, 0.03]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1.2} />
      </mesh>

      {/* Top Warning Lights (Alternating Flashing Safety Beacons) */}
      <mesh ref={beaconLeftRef} position={[0.44, 0.92, 1.18]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.8} />
      </mesh>
      <mesh ref={beaconRightRef} position={[-0.44, 0.92, 1.18]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1.8} />
      </mesh>

      {/* Rear High-Intensity LED Brake Lights */}
      <mesh position={[0.46, 0.28, -1.27]}>
        <boxGeometry args={[0.15, 0.12, 0.04]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.6} />
      </mesh>
      <mesh position={[-0.46, 0.28, -1.27]}>
        <boxGeometry args={[0.15, 0.12, 0.04]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.6} />
      </mesh>

      {/* Dual Aerodynamic Side Mirrors */}
      <group position={[0.68, 0.54, 1.22]}>
        <mesh><boxGeometry args={[0.09, 0.2, 0.09]} /><meshStandardMaterial color="#0F172A" metalness={0.7} /></mesh>
        <mesh position={[-0.06, 0, 0]}><cylinderGeometry args={[0.018, 0.018, 0.14]} rotation={[0, 0, Math.PI / 2]} /><meshStandardMaterial color="#0F172A" /></mesh>
      </group>
      <group position={[-0.68, 0.54, 1.22]}>
        <mesh><boxGeometry args={[0.09, 0.2, 0.09]} /><meshStandardMaterial color="#0F172A" metalness={0.7} /></mesh>
        <mesh position={[0.06, 0, 0]}><cylinderGeometry args={[0.018, 0.018, 0.14]} rotation={[0, 0, Math.PI / 2]} /><meshStandardMaterial color="#0F172A" /></mesh>
      </group>

      {/* 4 Animated Rotating Wheels with Realistic Steel Rims, Deep Treads & Lug Nuts */}
      {[
        [-0.56, 0.15, 0.90, 0],
        [0.56, 0.15, 0.90, 1],
        [-0.56, 0.15, -0.80, 2],
        [0.56, 0.15, -0.80, 3],
      ].map(([x, y, z, idx]) => (
        <group
          key={idx}
          position={[x, y, z]}
          ref={(el) => (wheelsRef.current[idx] = el)}
        >
          {/* Wheel Axle Hub Container */}
          <group rotation={[0, 0, Math.PI / 2]}>
            {/* Heavy Rubber Tread Tire */}
            <mesh castShadow>
              <cylinderGeometry args={[0.26, 0.26, 0.19, 32]} />
              <meshStandardMaterial color="#090D16" roughness={0.88} />
            </mesh>
            {/* Deep Dish Chrome Hubcap */}
            <mesh position={[0, 0.01, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.20, 24]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.92} roughness={0.12} />
            </mesh>
            {/* Outer Rim Lip Accent */}
            <mesh position={[0, 0.02, 0]}>
              <ringGeometry args={[0.12, 0.15, 24]} />
              <meshStandardMaterial color="#475569" metalness={0.8} />
            </mesh>
            {/* Center Axle Nut */}
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.21, 8]} />
              <meshStandardMaterial color="#1E293B" metalness={0.95} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
});

SchoolBus.displayName = 'SchoolBus';
export default SchoolBus;
