import React, { useState, useEffect } from 'react';
import { Radio, Wifi, WifiOff, ShieldAlert, Cpu } from 'lucide-react';

interface TopStatusBarProps {
  isWsConnected: boolean;
  activeBuoy?: string;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  isWsConnected,
  activeBuoy = 'OSB-001'
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeStr(now.toUTCString().replace('GMT', 'UTC'));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-ocean-950 border-b border-ocean-border/60 text-xs text-slate-300 px-4 py-2 flex flex-wrap items-center justify-between gap-3 select-none">
      {/* System Status Indicators */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-mono font-semibold tracking-wider text-emerald-400">SYSTEM ONLINE</span>
        </div>

        <div className="h-3 w-px bg-ocean-border/80"></div>

        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-slate-400">MODE:</span>
          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold px-1.5 py-0.5 rounded text-[11px] tracking-wide">
            SIMULATION
          </span>
        </div>

        <div className="h-3 w-px bg-ocean-border/80"></div>

        <div className="flex items-center gap-1.5 font-mono text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-ocean-cyan" />
          <span>BUOY:</span>
          <span className="text-ocean-cyan font-bold">{activeBuoy}</span>
        </div>

        <div className="h-3 w-px bg-ocean-border/80 hidden md:block"></div>

        <div className="hidden lg:flex items-center gap-1.5 text-slate-400 text-[11px] font-mono">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
          <span>NON-PRESUMPTIVE MARITIME RADAR: APPROXIMATE LOCALIZATION & SIMULATED AIS</span>
        </div>
      </div>

      {/* Clock & WebSocket Connectivity */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono text-slate-400">
          <span className="text-slate-500">LAST UPDATE:</span>
          <span className="text-slate-200 font-medium">{timeStr || 'SYNCHRONIZING...'}</span>
        </div>

        <div className="h-3 w-px bg-ocean-border/80"></div>

        <div className="flex items-center gap-1.5 font-mono text-[11px]">
          {isWsConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-ocean-cyan animate-pulse" />
              <span className="text-ocean-cyan font-medium">LIVE WS SYNC</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-rose-400 font-medium">RECONNECTING...</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
