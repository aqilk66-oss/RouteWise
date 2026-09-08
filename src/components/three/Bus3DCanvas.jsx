import Hero3DViewer, { Bus3DCanvas as AliasedBus3DCanvas } from '../hero/Hero3DViewer';

/**
 * Bus3DCanvas Component Export
 * 
 * Re-exports the upgraded RouteWise 3D Transportation Hero Canvas
 * ensuring all paths expecting `components/three/Bus3DCanvas` seamlessly render
 * the cinematic, optimized school bus visualization.
 */
export const Bus3DCanvas = AliasedBus3DCanvas;
export default Hero3DViewer;
