import React, { useState, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

const organicLogos = [
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ubuntu/ubuntu-original.svg", x: "82%", y: "25%", w: 64, mobX: "82%", mobY: "25%" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/debian/debian-original.svg", x: "92%", y: "38%", w: 56, mobX: "92%", mobY: "38%" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg", x: "92%", y: "62%", w: 60, mobX: "92%", mobY: "62%" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/archlinux/archlinux-original.svg", x: "82%", y: "75%", w: 60, mobX: "82%", mobY: "75%" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg", x: "72%", y: "62%", w: 56, mobX: "72%", mobY: "62%" },
  { src: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg", x: "72%", y: "38%", w: 72, mobX: "72%", mobY: "38%" },
];

const DistroSpotlightOrbit = React.forwardRef<HTMLDivElement, any>((props, ref) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [hasMouseMoved, setHasMouseMoved] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!hasMouseMoved) setHasMouseMoved(true);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, hasMouseMoved]);

  const maskImage = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;

  return (
    <div ref={ref} className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
      {/* Ambient Base Layer (PC) - Always faintly visible */}
      <div className="absolute inset-0 z-0 pointer-events-none hidden md:block opacity-[0.05]">
        {organicLogos.map((logo, i) => (
          <img 
            key={`ambient-${i}`} 
            src={logo.src} 
            alt="Distro" 
            className="absolute grayscale"
            style={{ left: logo.x, top: logo.y, width: logo.w, height: 'auto' }} 
          />
        ))}
      </div>

      {/* Organic Flashlight Reveal Layer (PC) */}
      <motion.div 
        className="absolute inset-0 z-0 pointer-events-none hidden md:block opacity-80"
        style={{ WebkitMaskImage: hasMouseMoved ? maskImage : 'none', maskImage: hasMouseMoved ? maskImage : 'none' }}
      >
        {organicLogos.map((logo, i) => (
          <motion.img 
            key={`reveal-${i}`} 
            src={logo.src} 
            alt="Distro" 
            className="absolute drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            style={{ left: logo.x, top: logo.y, width: logo.w, height: 'auto' }} 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: "easeInOut" }}
          />
        ))}
      </motion.div>

      {/* Mobile Background Fallback */}
      <div className="absolute inset-0 z-0 pointer-events-none md:hidden overflow-hidden">
        {organicLogos.map((logo, i) => (
          <motion.img
            key={`mob-${i}`}
            src={logo.src}
            alt="Distro"
            className="absolute opacity-[0.25] grayscale"
            style={{
              left: logo.mobX,
              top: logo.mobY,
              width: logo.w * 0.75,
            }}
            animate={{
              y: [0, 15, 0],
              rotate: [0, Math.random() * 10 - 5, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 5 + i,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
});

DistroSpotlightOrbit.displayName = 'DistroSpotlightOrbit';

export default DistroSpotlightOrbit;
