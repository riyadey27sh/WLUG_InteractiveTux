import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

const TuxEyeTracker = ({ scrollProgress = 0 }) => {
  // Track cursor position
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Smooth springs for eye movement
  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const leftEyeX = useSpring(0, springConfig);
  const leftEyeY = useSpring(0, springConfig);
  const rightEyeX = useSpring(0, springConfig);
  const rightEyeY = useSpring(0, springConfig);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Calculate vector for each eye
    const calculatePupilOffset = (eyeElement: HTMLElement | null) => {
      if (!eyeElement) return { x: 0, y: 0 };
      
      const rect = eyeElement.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = mousePos.x - eyeCenterX;
      const dy = mousePos.y - eyeCenterY;
      
      // Calculate distance to mouse
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Max clamp distance for pupil orbit (5px as requested)
      const maxClamp = 5;
      
      if (distance === 0) return { x: 0, y: 0 };
      
      // Normalize and multiply by distance, capped at maxClamp
      const ratio = Math.min(distance, maxClamp * 10) / (maxClamp * 10);
      const clampedDistance = maxClamp * Math.min(1, ratio);
      
      return {
        x: (dx / distance) * clampedDistance,
        y: (dy / distance) * clampedDistance
      };
    };

    const leftEye = document.getElementById('tux-left-eye');
    const rightEye = document.getElementById('tux-right-eye');

    const leftOffset = calculatePupilOffset(leftEye);
    const rightOffset = calculatePupilOffset(rightEye);

    leftEyeX.set(leftOffset.x);
    leftEyeY.set(leftOffset.y);
    rightEyeX.set(rightOffset.x);
    rightEyeY.set(rightOffset.y);

  }, [mousePos, leftEyeX, leftEyeY, rightEyeX, rightEyeY]);

  // Fade out early: as soon as user scrolls > 2%
  const opacity = scrollProgress > 0.02 ? 0 : 1;

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center transition-opacity duration-300"
      style={{ opacity }}
    >
      {/* 
        Container positioned relative to center of screen. 
        Need to adjust transform to match exact position of Tux's eyes on Frame 1.
        Assuming Tux looks mostly forward and is roughly centered.
      */}
      <div className="relative w-full h-full max-w-4xl max-h-screen">
        {/* We place a container for the eyes. These coordinates are approximate and should be tweaked based on the actual frame 1 image */}
        <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex gap-[50px] md:gap-[60px] ml-1 md:ml-2">
          
          {/* Left Eye */}
          <div className="relative w-8 h-10 md:w-10 md:h-12 bg-transparent rounded-full flex items-center justify-center">
            <motion.div
              id="tux-left-eye"
              style={{ x: leftEyeX, y: leftEyeY }}
              className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            >
              {/* Inner pupil reflection */}
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[#A0C4E2] rounded-full translate-x-[1px] -translate-y-[1px]" />
            </motion.div>
          </div>

          {/* Right Eye */}
          <div className="relative w-8 h-10 md:w-10 md:h-12 bg-transparent rounded-full flex items-center justify-center mt-[-2px]">
            <motion.div
              id="tux-right-eye"
              style={{ x: rightEyeX, y: rightEyeY }}
              className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            >
              {/* Inner pupil reflection */}
              <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-[#A0C4E2] rounded-full translate-x-[1px] -translate-y-[1px]" />
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TuxEyeTracker;
