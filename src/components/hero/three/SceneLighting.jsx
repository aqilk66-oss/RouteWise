import React from 'react';

/**
 * Three-point inspired lighting setup balanced for RouteWise color grading
 */
export const SceneLighting = () => {
  return (
    <>
      {/* Soft Ambient Light for Fill */}
      <ambientLight intensity={0.95} color="#FFFFFF" />

      {/* Sky / Ground Hemisphere Light for realistic environmental radiance */}
      <hemisphereLight skyColor="#BAE6FD" groundColor="#E2E8F0" intensity={0.65} />

      {/* Key Directional Sun Light with Crisp Cast Shadows */}
      <directionalLight
        position={[10, 14, 8]}
        intensity={1.8}
        color="#FFFBEB"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
        shadow-camera-far={40}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={9}
        shadow-camera-bottom={-9}
      />

      {/* Vibrant Cyan / Teal Tech Rim Light */}
      <directionalLight
        position={[-8, 6, -6]}
        intensity={1.1}
        color="#06B6D4"
      />

      {/* Deep Navy Ground Bounce Accent */}
      <directionalLight
        position={[0, -4, 4]}
        intensity={0.35}
        color="#1E3A8A"
      />
    </>
  );
};

export default SceneLighting;
