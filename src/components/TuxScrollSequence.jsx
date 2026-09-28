import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'lucide-react';
import LinuxEasterEgg from './LinuxEasterEgg';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;

const TuxScrollSequence = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  
  const [images, setImages] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const loadedImages = [];

    const loadImages = async () => {
      for (let i = 1; i <= TOTAL_FRAMES; i++) {
        const img = new Image();
        const frameNumber = String(i).padStart(3, '0');
        img.src = `/sequence/ezgif-frame-${frameNumber}.jpg`;
        
        await new Promise((resolve) => {
          img.onload = () => {
            loadedCount++;
            setLoadingProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
            loadedImages.push(img);
            resolve();
          };
          img.onerror = () => {
            // Even if an image fails to load, we resolve to avoid infinite loading
            loadedCount++;
            setLoadingProgress(Math.floor((loadedCount / TOTAL_FRAMES) * 100));
            loadedImages.push(img);
            resolve();
          };
        });
      }
      setImages(loadedImages);
      setIsLoaded(true);
    };

    loadImages();
  }, []);

  // 2. Setup Canvas & ScrollTrigger
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
          scrub: 0.8,
        }
      });

      // Animate frame sequence
      tl.to(currentFrame, {
        frame: TOTAL_FRAMES - 1,
        snap: "frame",
        ease: "none",
        onUpdate: () => renderFrame(currentFrame.frame)
      }, 0);

      // Animate the About Section text to fade in as the tux sequence plays
      // Start revealing halfway through the scroll distance
      tl.fromTo(contentRef.current, 
        { opacity: 0, y: 50 }, 
        { opacity: 1, y: 0, ease: "power2.out", duration: 0.5 }, 
        0.5 // Relative timeline position (0 to 1) - starts at 50% of the timeline
      );
    }, containerRef);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      ctxGsap.revert(); // Clean up ScrollTrigger instances on unmount
    };
  }, [isLoaded, images]);

  return (
    <div ref={containerRef} className="relative w-full h-screen bg-black overflow-hidden">
      
      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0A0F] text-white">
          <div className="w-48 h-1 bg-white/20 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out" 
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="font-mono text-sm tracking-widest text-gray-400 uppercase">
            Loading Assets {loadingProgress}%
          </p>
        </div>
      )}

      {/* Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full object-cover z-0" 
      />

      {/* Content Layer (About Section) */}
      <div className="absolute inset-0 z-10 flex flex-col md:flex-row items-center pointer-events-none">
        
        {/* Left Space (Empty for Tux subject) */}
        <div className="hidden md:block w-1/2 h-full" />
        
        {/* Right Space (Content) */}
        <div className="w-full md:w-1/2 h-full flex items-center justify-center p-6 md:p-12">
          
          {/* Animated Container */}
          <div 
            ref={contentRef} 
            className="pointer-events-auto max-w-xl opacity-0 bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
              About <span className="text-primary">Us</span>.
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
                <div className="inline-flex items-center gap-3 px-5 py-3 rounded-lg bg-[#0A0A0F]/80 border border-white/20 hover:border-primary/50 text-gray-400 hover:text-white transition-all cursor-pointer group shadow-xl max-w-full overflow-hidden backdrop-blur-md">
                  <Terminal className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="font-mono text-sm tracking-wide truncate">
                    guest@wlug:~$ <span className="text-primary group-hover:text-white transition-colors">./init.sh</span>
                  </span>
                  <span className="w-2 h-4 bg-primary/50 animate-pulse ml-1 flex-shrink-0" />
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
