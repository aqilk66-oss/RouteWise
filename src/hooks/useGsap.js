import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Custom React Hook for safe GSAP context animations and automatic cleanup on unmount
 */
export const useGsap = (animationCallback, dependencies = []) => {
  const scopeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      animationCallback(gsap, ScrollTrigger);
    }, scopeRef);

    return () => ctx.revert();
  }, dependencies);

  return scopeRef;
};

export default useGsap;
