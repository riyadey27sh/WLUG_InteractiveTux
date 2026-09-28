"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BOOT_LINES } from "./bootLines";

export function BootScreen({ 
  onComplete, 
  isAssetLoaded, 
  assetProgress 
}: { 
  onComplete: () => void, 
  isAssetLoaded: boolean, 
  assetProgress: number 
}) {
  const [phase, setPhase] = useState<"init" | "grub" | "kernel" | "logs" | "motto" | "done">("init");
  const [logIndex, setLogIndex] = useState(0);
  const [mottoText, setMottoText] = useState("");
  const [showHint, setShowHint] = useState(false);
  
  const shouldReduceMotion = useReducedMotion();
  const fullMotto = "Community | Knowledge | Share";

  useEffect(() => {    if (shouldReduceMotion) {
      setPhase("motto");
      setMottoText(fullMotto);
      setTimeout(finishBoot, 1500);
      return;
    }

    setPhase("grub");
    
    const grubTimer = setTimeout(() => {
      setPhase("kernel");
    }, 1200);

    const hintTimer = setTimeout(() => {
      setShowHint(true);
    }, 1000);

    return () => {
      clearTimeout(grubTimer);
      clearTimeout(hintTimer);
    };
  }, [shouldReduceMotion]);

  useEffect(() => {
    if (phase === "kernel") {
      const timer = setTimeout(() => {
        setPhase("logs");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "logs") {
      if (logIndex < BOOT_LINES.length) {
        const delay = Math.random() * 60 + 20;
        const timer = setTimeout(() => {
          setLogIndex(prev => prev + 1);
        }, delay);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setPhase("motto"), 400);
        return () => clearTimeout(timer);
      }
    }
  }, [phase, logIndex]);

  useEffect(() => {
    if (phase === "motto" && !shouldReduceMotion) {
      let i = 0;
      const typeTimer = setInterval(() => {
        if (i <= fullMotto.length) {
          setMottoText(fullMotto.slice(0, i));
          i++;
        } else {
          clearInterval(typeTimer);
        }
      }, 50);
      return () => clearInterval(typeTimer);
    }
  }, [phase, shouldReduceMotion]);

  // Wait for motto typing to finish AND assets to be fully loaded
  useEffect(() => {
    if (phase === "motto" && mottoText === fullMotto && isAssetLoaded) {
      const timer = setTimeout(finishBoot, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, mottoText, isAssetLoaded]);

  const finishBoot = () => {
    setPhase("done");
    setTimeout(onComplete, 800); // Allow exit animation to play
  };

  useEffect(() => {
    const handleSkip = () => {
      if (phase !== "done" && phase !== "init" && isAssetLoaded) {
        finishBoot();
      }
    };
    window.addEventListener("keydown", handleSkip);
    window.addEventListener("click", handleSkip);
    window.addEventListener("touchstart", handleSkip);
    return () => {
      window.removeEventListener("keydown", handleSkip);
      window.removeEventListener("click", handleSkip);
      window.removeEventListener("touchstart", handleSkip);
    };
  }, [phase]);

  if (phase === "done" || phase === "init") return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black text-[#A9B1D6] font-mono p-4 md:p-8 overflow-hidden select-none"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] opacity-20 z-50" />
        
        <div className="relative z-10 w-full h-full max-w-5xl mx-auto flex flex-col justify-end">
          {phase === "grub" && (
            <div className="flex-1 flex flex-col pt-8">
              <div className="mb-4">GNU GRUB  version 2.12</div>
              <div className="border border-[#A9B1D6] p-1 w-full max-w-2xl mb-4">
                <div className="bg-white text-black px-2 py-1">*WLUG Linux</div>
                <div className="px-2 py-1 text-gray-400"> WLUG Linux (recovery mode)</div>
                <div className="px-2 py-1 text-gray-400"> Advanced options for WLUG</div>
              </div>
              <div className="text-sm text-gray-500">
                Use the ↑ and ↓ keys to select. Press enter to boot.
              </div>
            </div>
          )}

          {phase === "kernel" && (
            <div className="flex-1 flex flex-col pt-8 text-sm md:text-base leading-tight gap-1">
              <div className="text-gray-300">Loading Linux 6.9.0-wlug ...</div>
              <motion.div 
                className="text-gray-300"
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.4 }}
              >
                Loading initial ramdisk ...
              </motion.div>
            </div>
          )}

          {phase === "logs" && (
            <div className="flex-1 flex flex-col justify-end overflow-hidden pb-8 text-sm md:text-base leading-tight">
              {BOOT_LINES.slice(0, logIndex).map((line, i) => {
                const time = (i * 0.05).toFixed(6);
                const showOk = line.includes("Loading") || line.includes("Mounting") || line.includes("Starting") || line.includes("Reached");
                return (
                  <div key={i} className="flex gap-4 w-full">
                    <span className="text-gray-500 w-[100px] shrink-0">[{time.padStart(12, ' ')}]</span>
                    <span className="flex-1 text-gray-300 break-all">{line}</span>
                    {showOk && <span className="text-green-500 font-bold shrink-0 ml-4">[ OK ]</span>}
                  </div>
                );
              })}
              
              {/* Asset Loading Progress */}
              <div className="flex gap-4 w-full mt-2">
                <span className="text-gray-500 w-[100px] shrink-0">[*]</span>
                <span className="flex-1 text-gray-300 break-all">
                  Preloading graphical assets ({assetProgress}%) ...
                </span>
                {isAssetLoaded && <span className="text-green-500 font-bold shrink-0 ml-4">[ OK ]</span>}
              </div>

              <div className="h-6 mt-1 flex items-center">
                <span className="w-2.5 h-4 bg-cyan-400 animate-pulse ml-[116px]" />
              </div>
            </div>
          )}

          {phase === "motto" && (
            <div className="absolute inset-0 flex items-center justify-center px-4">
              <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-sans font-bold tracking-widest text-white flex items-center whitespace-nowrap">
                {mottoText}
                <span className="w-2 h-5 sm:w-3 sm:h-6 md:w-4 md:h-8 lg:w-5 lg:h-10 xl:w-6 xl:h-12 bg-cyan-400 animate-pulse ml-2 sm:ml-3 md:ml-4" />
              </div>
            </div>
          )}
          
          {showHint && (
            <div className="absolute bottom-4 right-4 text-xs text-gray-500 animate-pulse">
              Press any key or tap to skip
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
