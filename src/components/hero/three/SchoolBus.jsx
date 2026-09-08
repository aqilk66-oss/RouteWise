import React, { forwardRef, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Premium Stylized School Bus 3D Model
 * 
 * Design Characteristics:
 * - Refined warm school bus amber/gold body (#E5A93C / #D99B26) with balanced saturation
 * - Rounded chamfered body with realistic aerodynamic front taper
 * - Deep navy (#0F172A) heavy-duty front grille with chrome louvers
 * - Premium tinted glass with subtle blue-sky Fresnel reflections
 * - Synchronized rotating wheels with dual rubber tires, steel rims, and center lug nuts
 * - High-mount amber & red safety flashers with gentle pulse
 * - Dual side aerodynamic mirrors, roof emergency hatches, and fold-out STOP sign
 * - Restrained scale matching 65-70% usable scene height
 */
export const SchoolBus = forwardRef(({ 
  position = [0, 0.42, 0], 
  rotation = [0, 0, 0],
  scale = [0.88, 0.88, 0.88] 
}, ref) => {
  const wheelsRef = useRef([]);
  const beaconLeftRef = useRef();
  const beaconRightRef = useRef();

  useFrame((state, delta) => {
    // Spin wheels smoothly with safe delta clamping
    const safeDelta = Math.min(delta || 0.016, 0.05);
    wheelsRef.current.forEach((wheel) => {
      if (wheel) {
        wheel.rotation.x += safeDelta * 4.2;
      }
    });

    // Flashing safety beacon lights with gentle sinusoidal glow
    const time = state.clock.getElapsedTime();
    const flash1 = 0.4 + (Math.sin(time * 6) > 0 ? 1.2 : 0.0);
    const flash2 = 0.4 + (Math.sin(time * 6 + Math.PI) > 0 ? 1.2 : 0.0);

    if (beaconLeftRef.current) {
      beaconLeftRef.current.material.emissiveIntensity = flash1;
    }
    if (beaconRightRef.current) {
      beaconRightRef.current.material.emissiveIntensity = flash2;
    }
  });

  // Materials & Colors
  const bodyColor = "#E5A93C"; // Warm golden yellow (not harsh neon)
  const roofColor = "#EAB308"; // Controlled roof amber
  const navyTrim = "#0F172A";  // Deep navy chassis/trim
  const bumperColor = "#1E293B"; // Dark slate bumper
  const glassColor = "#0284C7"; // Deep sky blue tinted reflection

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      {/* --- Main Passenger Body --- */}
      <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.22, 0.74, 2.6]} />
        <meshStandardMaterial 
          color={bodyColor} 
          roughness={0.28} 
          metalness={0.12} 
        />
      </mesh>

      {/* --- Aerodynamic Curved Roof Crown --- */}
      <mesh position={[0, 0.88, 0]} castShadow>
        <boxGeometry args={[1.16, 0.1, 2.56]} />
        <meshStandardMaterial 
          color={roofColor} 
          roughness={0.3} 
          metalness={0.08} 
        />
      </mesh>

      {/* Roof Emergency Ventilation Hatches */}
      <mesh position={[0, 0.94, 0.4]}>
        <boxGeometry args={[0.42, 0.04, 0.42]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.94, -0.6]}>
        <boxGeometry args={[0.42, 0.04, 0.42]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.5} />
      </mesh>

      {/* GPS Telematics Dome on Roof */}
      <mesh position={[0, 0.95, -0.05]}>
        <cylinderGeometry args={[0.07, 0.09, 0.06, 16]} />
        <meshStandardMaterial color="#0F172A" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.99, -0.05]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#14B8A6" />
      </mesh>

      {/* --- Front Engine Hood (Tapered) --- */}
      <mesh position={[0, 0.3, 1.48]} castShadow receiveShadow>
        <boxGeometry args={[1.08, 0.52, 0.74]} />
        <meshStandardMaterial 
          color={bodyColor} 
          roughness={0.28} 
          metalness={0.12} 
        />
      </mesh>

      {/* Hood Upper Bevel Angle */}
      <mesh position={[0, 0.54, 1.34]} rotation={[-0.22, 0, 0]}>
        <boxGeometry args={[1.02, 0.08, 0.45]} />
        <meshStandardMaterial color={bodyColor} roughness={0.28} metalness={0.12} />
      </mesh>

      {/* Front Chrome & Slate Grille */}
      <mesh position={[0, 0.28, 1.86]}>
        <boxGeometry args={[0.82, 0.36, 0.03]} />
        <meshStandardMaterial color={navyTrim} roughness={0.5} metalness={0.8} />
      </mesh>
      {/* Grille Horizontal Chrome Strips */}
      {[-0.08, 0.0, 0.08].map((yOffset, i) => (
        <mesh key={i} position={[0, 0.28 + yOffset, 1.88]}>
          <boxGeometry args={[0.74, 0.025, 0.02]} />
          <meshStandardMaterial color="#E2E8F0" metalness={0.9} roughness={0.15} />
        </mesh>
      ))}

      {/* --- Heavy-Duty Front Steel Bumper --- */}
      <mesh position={[0, 0.1, 1.87]} castShadow>
        <boxGeometry args={[1.28, 0.15, 0.12]} />
        <meshStandardMaterial color={bumperColor} metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Rear Steel Bumper */}
      <mesh position={[0, 0.1, -1.33]} castShadow>
        <boxGeometry args={[1.28, 0.15, 0.12]} />
        <meshStandardMaterial color={bumperColor} metalness={0.85} roughness={0.3} />
      </mesh>

      {/* --- Front Windshield (Dual-Pane Automotive Safety Glass) --- */}
      <mesh position={[0, 0.65, 1.14]} rotation={[-0.16, 0, 0]}>
        <boxGeometry args={[1.02, 0.46, 0.04]} />
        <meshPhysicalMaterial 
          color={glassColor} 
          transparent 
          opacity={0.82} 
          roughness={0.05} 
          metalness={0.15}
          transmission={0.35}
          ior={1.5}
        />
      </mesh>
      {/* Windshield Center Divider Bar */}
      <mesh position={[0, 0.65, 1.15]} rotation={[-0.16, 0, 0]}>
        <boxGeometry args={[0.035, 0.46, 0.05]} />
        <meshStandardMaterial color={navyTrim} roughness={0.5} />
      </mesh>

      {/* Front Destination Indicator ("ROUTEWISE") */}
      <mesh position={[0, 0.91, 1.22]} rotation={[-0.12, 0, 0]}>
        <boxGeometry args={[0.82, 0.11, 0.05]} />
        <meshStandardMaterial color={navyTrim} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.91, 1.25]} rotation={[-0.12, 0, 0]}>
        <planeGeometry args={[0.76, 0.075]} />
        <meshStandardMaterial color="#FBBF24" emissive="#D97706" emissiveIntensity={0.5} />
      </mesh>

      {/* --- Rear Panoramic Window --- */}
      <mesh position={[0, 0.62, -1.31]} rotation={[0, Math.PI, 0]}>
        <boxGeometry args={[0.96, 0.4, 0.04]} />
        <meshPhysicalMaterial 
          color={glassColor} 
          transparent 
          opacity={0.8} 
          roughness={0.05} 
          metalness={0.1}
        />
      </mesh>

      {/* --- Side Passenger Windows (5 Elegant Tinted Bays Per Side) --- */}
      {[-0.8, -0.4, 0.0, 0.4, 0.8].map((zOffset, i) => (
        <group key={`windows-${i}`}>
          {/* Right Side Window */}
          <mesh position={[0.62, 0.62, zOffset]}>
            <boxGeometry args={[0.03, 0.38, 0.32]} />
            <meshPhysicalMaterial color={glassColor} transparent opacity={0.78} roughness={0.05} />
          </mesh>
          {/* Left Side Window */}
          <mesh position={[-0.62, 0.62, zOffset]}>
            <boxGeometry args={[0.03, 0.38, 0.32]} />
            <meshPhysicalMaterial color={glassColor} transparent opacity={0.78} roughness={0.05} />
          </mesh>
        </group>
      ))}

      {/* Passenger Door Cutout (Front Right Side) */}
      <mesh position={[0.62, 0.34, 1.02]}>
        <boxGeometry args={[0.02, 0.58, 0.28]} />
        <meshStandardMaterial color={navyTrim} roughness={0.6} />
      </mesh>

      {/* --- Black Heavy Rub Rails Along Body Sides --- */}
      <mesh position={[0, 0.38, 0]}>
        <boxGeometry args={[1.25, 0.035, 2.58]} />
        <meshStandardMaterial color={navyTrim} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.24, 0]}>
        <boxGeometry args={[1.25, 0.035, 2.58]} />
        <meshStandardMaterial color={navyTrim} roughness={0.6} />
      </mesh>

      {/* --- Fold-Out STOP Sign (Driver Side) --- */}
      <group position={[-0.65, 0.52, 0.3]}>
        <mesh rotation={[0, 0, Math.PI / 8]}>
          <cylinderGeometry args={[0.12, 0.12, 0.018, 8]} />
          <meshStandardMaterial color="#DC2626" roughness={0.35} />
        </mesh>
        <mesh position={[-0.005, 0, 0]} rotation={[0, 0, Math.PI / 8]}>
          <cylinderGeometry args={[0.095, 0.095, 0.02, 8]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
      </group>

      {/* --- Front Warm Xenon Headlights --- */}
      <mesh position={[0.42, 0.3, 1.86]}>
        <cylinderGeometry args={[0.08, 0.08, 0.035, 24]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#FFFBEB" emissive="#FEF08A" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-0.42, 0.3, 1.86]}>
        <cylinderGeometry args={[0.08, 0.08, 0.035, 24]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#FFFBEB" emissive="#FEF08A" emissiveIntensity={1.2} />
      </mesh>

      {/* Front Amber Directional Indicators */}
      <mesh position={[0.51, 0.3, 1.84]}>
        <boxGeometry args={[0.065, 0.065, 0.025]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[-0.51, 0.3, 1.84]}>
        <boxGeometry args={[0.065, 0.065, 0.025]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={0.8} />
      </mesh>

      {/* Top Roof Warning Flasher Domes (Alternating Pulse) */}
      <mesh ref={beaconLeftRef} position={[0.45, 0.94, 1.22]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.2} />
      </mesh>
      <mesh ref={beaconRightRef} position={[-0.45, 0.94, 1.22]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1.2} />
      </mesh>

      {/* Rear High-Visibility LED Brake Lights */}
      <mesh position={[0.48, 0.3, -1.32]}>
        <boxGeometry args={[0.12, 0.1, 0.03]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[-0.48, 0.3, -1.32]}>
        <boxGeometry args={[0.12, 0.1, 0.03]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.2} />
      </mesh>

      {/* --- Dual Aerodynamic Side Mirrors --- */}
      <group position={[0.69, 0.58, 1.28]}>
        <mesh>
          <boxGeometry args={[0.08, 0.18, 0.07]} />
          <meshStandardMaterial color={navyTrim} metalness={0.7} />
        </mesh>
        <mesh position={[-0.05, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={navyTrim} />
        </mesh>
      </group>
      <group position={[-0.69, 0.58, 1.28]}>
        <mesh>
          <boxGeometry args={[0.08, 0.18, 0.07]} />
          <meshStandardMaterial color={navyTrim} metalness={0.7} />
        </mesh>
        <mesh position={[0.05, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.12]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={navyTrim} />
        </mesh>
      </group>

      {/* --- 4 Wheels (Synchronized Rotation, Rubber Treads, Steel Rims) --- */}
      {[
        [-0.58, 0.17, 0.95, 0],
        [0.58, 0.17, 0.95, 1],
        [-0.58, 0.17, -0.85, 2],
        [0.58, 0.17, -0.85, 3],
      ].map(([x, y, z, idx]) => (
        <group
          key={idx}
          position={[x, y, z]}
          ref={(el) => (wheelsRef.current[idx] = el)}
        >
          <group rotation={[0, 0, Math.PI / 2]}>
            {/* Rubber Tire */}
            <mesh castShadow>
              <cylinderGeometry args={[0.26, 0.26, 0.18, 28]} />
              <meshStandardMaterial color="#0B0F19" roughness={0.9} />
            </mesh>
            {/* Chrome Steel Rim */}
            <mesh position={[0, 0.01, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 0.19, 20]} />
              <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.18} />
            </mesh>
            {/* Center Axle Nut */}
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.2, 8]} />
              <meshStandardMaterial color={navyTrim} metalness={0.9} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  );
});

SchoolBus.displayName = 'SchoolBus';
export default SchoolBus;
