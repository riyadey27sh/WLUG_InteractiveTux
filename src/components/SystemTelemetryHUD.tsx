import React from 'react';

const SystemTelemetryHUD = () => {
  return (
    <div className="w-64 p-4 rounded-2xl bg-[#1C3041]/35 border border-white/10 backdrop-blur-xl shadow-2xl font-mono text-xs text-white/80">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[#A0C4E2] font-semibold text-[11px] tracking-wider uppercase">SYS_TELEMETRY</span>
        </div>
        <span className="text-[10px] text-white/40">tty1</span>
      </div>
      
      <div className="space-y-1.5 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-white/50">kernel</span>
          <span className="text-[#D4E9F7] font-medium">6.12-arch-lts</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/50">branch</span>
          <span className="text-emerald-400 font-medium">main [clean]</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/50">contributors</span>
          <span className="text-[#D4E9F7] font-medium">140+ active</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white/50">uptime</span>
          <span className="text-[#D4E9F7] font-medium">21_years (est. 2003)</span>
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[10px]">
          <span className="text-white/40">status</span>
          <span className="text-[#A0C4E2]">[OK] system ready</span>
        </div>
      </div>
    </div>
  );
};

export default SystemTelemetryHUD;
