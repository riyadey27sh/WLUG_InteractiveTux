import React, { useEffect, useRef } from 'react';
import { Terminal, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LinuxEasterEgg from './LinuxEasterEgg';
import InteractiveDotGrid from './InteractiveDotGrid';
import DistroSpotlightOrbit from './DistroSpotlightOrbit';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { usePreload } from './boot/BootProvider';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;

const TuxScrollSequence = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const heroRef = useRef(null);
  const logosRef = useRef(null);
  
  const { images, isLoaded } = usePreload();

  // Setup Canvas & ScrollTrigger
  useEffect(() => {
    if (!isLoaded || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Handle High DPI and Resizing
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      renderFrame(currentFrame.frame);
    };

    // Draw frame onto canvas with cover aspect ratio
    const renderFrame = (index) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const img = images[Math.round(index)];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const rect = canvas.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      // Cover scaling
      const hRatio = canvasWidth / img.width;
      const vRatio = canvasHeight / img.height;
      const ratio = Math.max(hRatio, vRatio);
      
      const centerShift_x = (canvasWidth - img.width * ratio) / 2;
      const centerShift_y = (canvasHeight - img.height * ratio) / 2;
      
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(
        img,
        0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio
      );
    };

    window.addEventListener('resize', resizeCanvas);
    
    const currentFrame = { frame: 0 };
    
    // Initial draw
    resizeCanvas();

    // GSAP ScrollTrigger setup
    const ctxGsap = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          pin: true,
          start: "top top",
          end: "+=1800px",
          scrub: 1, // Numeric scrub for smooth physics easing
        }
      });

      // 1. Animate Hero Section out (0% to 18%)
      tl.to([heroRef.current, logosRef.current], {
        opacity: 0,
        y: -20,
        pointerEvents: "none",
        ease: "power2.inOut",
        duration: 0.18
      }, 0);

      // 2. Animate frame sequence over 15% to 75% of scroll
      tl.to(currentFrame, {
        frame: TOTAL_FRAMES - 1,
        ease: "none",
        duration: 0.60,
        onUpdate: () => renderFrame(currentFrame.frame)
      }, 0.15);

      // 4. Animate the About Section text to fade in (50% to 100%)
      tl.fromTo(contentRef.current, 
        { opacity: 0, x: 50 }, 
        { opacity: 1, x: 0, ease: "power2.out", duration: 0.50 }, 
        0.50 
      );
    }, containerRef);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ctxGsap.revert(); // Clean up ScrollTrigger instances on unmount
    };
  }, [isLoaded, images]);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-screen bg-[#000000] overflow-hidden"
    >
      
      {/* Background Grids */}
      <div ref={logosRef} className="absolute inset-0 z-0">
        {/* Layer 0: Interactive Dot Grid */}
        <InteractiveDotGrid />
        
        {/* Layer 1: Distro Spotlight Orbit */}
        <DistroSpotlightOrbit />
      </div>

      {/* Layer 2: Tux Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full object-cover z-20 pointer-events-none mix-blend-screen" 
        style={{ filter: 'contrast(1.2) brightness(0.85)' }}
      />

      {/* Layer 3: HERO SECTION OVERLAY (Left-Anchored) */}
      <div 
        ref={heroRef}
        className="absolute inset-0 z-30 flex flex-col justify-center pointer-events-none"
      >
        <div className="max-w-xl text-left pl-8 md:pl-16 z-20 pointer-events-auto mt-20 flex flex-col items-start">
          {/* Title */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.95] drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]">
            Walchand Linux <br />
            <span className="text-[#A0C4E2] bg-gradient-to-r from-white via-[#D4E9F7] to-[#8FAECB] bg-clip-text text-transparent">
              Users' Group
            </span>
          </h1>

          {/* Motto Accent (Left-Aligned below headline) */}
          <div className="mt-8 mb-8 border-l-2 border-[#A0C4E2] pl-4 py-1">
            <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.2em] text-[#A0C4E2] opacity-80 uppercase drop-shadow-sm">
              Code &bull; Collaborate &bull; Contribute
            </span>
          </div>

          {/* CTA Row (Left-Aligned below motto) */}
          <div className="flex flex-wrap items-center gap-5">
            <Link to="/events" className="group px-7 py-3.5 rounded-full bg-white text-black font-bold tracking-wide hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center">
              Explore Events
            </Link>
            <button 
              onClick={() => window.scrollTo({ top: window.innerHeight * 1.6, behavior: 'smooth' })}
              className="group px-7 py-3.5 rounded-full bg-[#0A1118]/60 border border-white/10 text-gray-300 hover:text-white hover:border-white/30 backdrop-blur-md hover:bg-[#1C3041]/60 hover:scale-105 transition-all duration-300 flex items-center justify-center"
            >
              Discover More
            </button>
          </div>
        </div>
      </div>

      {/* Content Layer (About Section, higher z-index to overlay) */}
      <div className="absolute inset-0 z-40 flex flex-col md:flex-row items-center pointer-events-none">
        
        {/* Left Space (Empty for Tux subject) */}
        <div className="hidden md:block w-1/2 h-full" />
        
        {/* Right Space (Content) */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center p-6 md:p-12">
          
          {/* Animated Container */}
          <div 
            ref={contentRef} 
            className="pointer-events-auto max-w-xl bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-[#1C3041]/50 shadow-[0_0_40px_rgba(28,48,65,0.3)]"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#FFFFFF] mb-6 tracking-tight drop-shadow-lg">
              About <span className="text-[#A0C4E2]">Us</span>.
            </h2>
            
            <div className="space-y-4 text-gray-300 leading-relaxed text-base md:text-lg mb-10 drop-shadow-md">
              <p>
                Established in 2003 at Walchand College of Engineering, Sangli.
                WLUG is a collective of passionate developers and open-source purists.
              </p>
              <p>
                We bridge the gap between beginners and fully-fledged open-source contributors.
                From bootcamps and hackathons to technical deep-dives, our mission is to empower through knowledge.
              </p>
            </div>

            {/* Seamless Terminal Trigger */}
            <div className="flex">
              <LinuxEasterEgg>
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-[#000000]/80 border border-[#1C3041] hover:border-[#A0C4E2]/70 text-[#A0C4E2] hover:text-[#FFFFFF] transition-all cursor-pointer group shadow-xl max-w-full overflow-hidden backdrop-blur-md">
                  <Terminal className="w-4 h-4 text-[#A0C4E2] group-hover:text-[#FFFFFF] flex-shrink-0 transition-colors" />
                  <span className="font-mono text-sm tracking-wide truncate">
                    guest@wlug:~$ <span className="text-[#A0C4E2] group-hover:text-[#FFFFFF] transition-colors">./init.sh</span>
                  </span>
                  <span className="w-2 h-4 bg-[#A0C4E2]/70 animate-pulse ml-1 flex-shrink-0" />
                </div>
              </LinuxEasterEgg>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default TuxScrollSequence;
