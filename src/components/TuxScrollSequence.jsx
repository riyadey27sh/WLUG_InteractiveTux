import React, { useEffect, useRef } from 'react';
import { Terminal, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LinuxEasterEgg from './LinuxEasterEgg';
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
  
  const { images, isLoaded } = usePreload();

  // Setup Canvas & ScrollTrigger
  useEffect(() => {
    if (!isLoaded || images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Handle High DPI and Resizing
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      renderFrame(currentFrame.frame);
    };

    // Draw frame onto canvas with cover aspect ratio
    const renderFrame = (index) => {
      const img = images[Math.round(index)];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const rect = canvas.getBoundingClientRect();
      const canvasWidth = rect.width;
      const canvasHeight = rect.height;

      // Cover scaling
      const hRatio = canvasWidth / img.width;
      const vRatio = canvasHeight / img.height;
      const ratio = Math.max(hRatio, vRatio); // Use Math.max for cover, Math.min for contain
      
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
          end: "+=3000",
          scrub: 1, // Smooth scrub
        }
      });

      // 1. Animate Hero Section out (0% to 25%)
      tl.to(heroRef.current, {
        opacity: 0,
        y: -40,
        ease: "power2.inOut",
        duration: 0.25
      }, 0);

      // 2. Animate frame sequence over 0% to 80% of scroll
      tl.to(currentFrame, {
        frame: TOTAL_FRAMES - 1,
        snap: "frame",
        ease: "none",
        duration: 0.8,
        onUpdate: () => renderFrame(currentFrame.frame)
      }, 0);

      // 3. Animate the About Section text to fade in (50% to 100%)
      tl.fromTo(contentRef.current, 
        { opacity: 0, x: 50 }, 
        { opacity: 1, x: 0, ease: "power2.out", duration: 0.5 }, 
        0.5 
      );
    }, containerRef);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ctxGsap.revert(); // Clean up ScrollTrigger instances on unmount
    };
  }, [isLoaded, images]);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-[#000000] overflow-hidden">
      
      {/* Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full object-cover z-0" 
        style={{ filter: 'contrast(1.2) brightness(0.85)' }}
      />

      {/* Vignette Overlay to seamlessly blend edges into pure black */}
      <div className="absolute inset-0 z-[5] pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.8)_80%,#000000_100%)]" />

      {/* HERO SECTION OVERLAY (Centered) */}
      <div 
        ref={heroRef}
        className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none"
      >
        <div className="max-w-5xl mx-auto text-center px-4 md:px-6 pointer-events-auto">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tighter mb-6 leading-tight flex flex-col items-center justify-center gap-y-2 select-none drop-shadow-[0_0_25px_rgba(28,48,65,0.8)]">
            <span className="inline-flex text-[#FFFFFF]">
              Walchand Linux
            </span>
            <span className="inline-flex text-transparent bg-clip-text bg-gradient-to-r from-[#D4E9F7] to-[#A0C4E2]">
              Users' Group
            </span>
          </h1>

          {/* Tagline */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-8 text-xs md:text-2xl font-mono text-[#A0C4E2] font-bold uppercase tracking-[0.2em] md:tracking-[0.25em] mb-12 drop-shadow-[0_0_15px_rgba(28,48,65,0.8)]">
            <span className="cursor-default">CODE</span>
            <span className="cursor-default">COLLABORATE</span>
            <span className="cursor-default">CONTRIBUTE</span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/events" className="flex items-center justify-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-[#1C3041] hover:bg-[#A0C4E2] text-[#FFFFFF] hover:text-[#1C3041] rounded-lg font-bold transition-all duration-300 group shadow-[0_0_20px_rgba(28,48,65,0.5)] hover:shadow-[0_0_25px_rgba(160,196,226,0.6)]">
              Explore Events
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button 
              onClick={() => window.scrollTo({ top: window.innerHeight * 1.5, behavior: 'smooth' })} 
              className="flex items-center justify-center px-6 py-3 md:px-8 md:py-4 border-2 border-[#1C3041] hover:border-[#A0C4E2] text-[#A0C4E2] hover:text-[#FFFFFF] hover:bg-[#1C3041]/30 rounded-lg font-bold transition-all duration-300 backdrop-blur-sm"
            >
              Discover More
            </button>
          </div>
        </div>
      </div>

      {/* Content Layer (About Section) */}
      <div className="absolute inset-0 z-10 flex flex-col md:flex-row items-center pointer-events-none">
        
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
