import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Eye, Compass, Navigation, Hash, ArrowRight } from 'lucide-react';
import { Detection } from '../types';

interface HeroThreatCardProps {
  detection: Detection | null;
  onInvestigate: (detectionId: number) => void;
}

export const HeroThreatCard: React.FC<HeroThreatCardProps> = ({
  detection,
  onInvestigate
}) => {
  if (!detection) {
    return (
      <div className="bg-ocean-900 border border-ocean-border rounded-xl p-6 text-center text-slate-400 font-mono">
        No active detections in perimeter. Initiate a simulation scenario above.
      </div>
    );
  }

  const isDarkVessel = detection.status === 'POSSIBLE_DARK_VESSEL' || detection.risk_score >= 80;
  const isMismatch = detection.status === 'PHYSICAL_AIS_MISMATCH' || (detection.risk_score >= 60 && detection.risk_score < 80);
  
  const badgeColor = isDarkVessel 
    ? 'border-rose-500/80 bg-rose-950/60 text-rose-300 shadow-glow-red'
    : isMismatch 
      ? 'border-amber-500/80 bg-amber-950/60 text-amber-300 shadow-glow-amber'
      : 'border-emerald-500/80 bg-emerald-950/60 text-emerald-300 shadow-glow-green';

  const riskColor = detection.risk_score >= 80
    ? 'text-rose-400'
    : detection.risk_score >= 60
      ? 'text-amber-400'
      : 'text-emerald-400';

  return (
    <div className={`rounded-xl border p-5 transition-all ${badgeColor} backdrop-blur-md`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Column: Status Badge & Vessel Name */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            {isDarkVessel ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-500 text-white tracking-wider animate-pulse">
                <ShieldAlert className="w-4 h-4" />
                POSSIBLE DARK VESSEL
              </span>
            ) : isMismatch ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-amber-500 text-black tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                PHYSICAL/AIS DISCREPANCY
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500 text-black tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                VERIFIED VESSEL
              </span>
            )}
            <span className="text-xs font-mono text-slate-300">
              BUOY REF: {detection.buoy_id}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl lg:text-3xl font-extrabold font-mono tracking-tight text-white uppercase">
              {detection.vessel_type}
            </h2>
            <span className="text-xs font-mono text-slate-300">
              AI CONFIDENCE: <strong className="text-ocean-cyan font-bold">{Math.round(detection.confidence * 100)}%</strong>
            </span>
          </div>

          <p className="text-xs text-slate-300 font-sans max-w-xl">
            {detection.recommendation}
          </p>
        </div>

        {/* Center Grid: Sensor Telemetry Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-ocean-950/60 p-3 rounded-lg border border-ocean-border/60">
          {/* AIS Status */}
          <div className="font-mono">
            <div className="text-[10px] text-slate-400 uppercase">AIS STATUS</div>
            <div className={`text-xs font-bold mt-0.5 ${
              detection.ais_status === 'NO_AIS_MATCH' ? 'text-rose-400' :
              detection.ais_status === 'PHYSICAL_AIS_MISMATCH' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {detection.ais_status === 'NO_AIS_MATCH' ? 'NO MATCH' :
               detection.ais_status === 'PHYSICAL_AIS_MISMATCH' ? 'MISMATCH' : 'MATCHED'}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {detection.ais_matched_mmsi ? `MMSI: ${detection.ais_matched_mmsi}` : 'NO AIS SIGNAL'}
            </div>
          </div>

          {/* Camera Status */}
          <div className="font-mono">
            <div className="text-[10px] text-slate-400 uppercase">CAMERA</div>
            <div className="text-xs font-bold mt-0.5 flex items-center gap-1 text-slate-100">
              <Eye className={`w-3 h-3 ${detection.camera_confirmed ? 'text-ocean-cyan' : 'text-slate-500'}`} />
              <span>{detection.camera_confirmed ? 'CONFIRMED' : 'NO CONTACT'}</span>
            </div>
            <div className="text-[10px] text-slate-400">OPTICAL SENSOR</div>
          </div>

          {/* Location / Geodetic */}
          <div className="font-mono">
            <div className="text-[10px] text-slate-400 uppercase">LOCATION</div>
            <div className="text-xs font-bold text-slate-100 mt-0.5">
              {detection.latitude.toFixed(4)}°N
            </div>
            <div className="text-[10px] text-slate-400">
              {detection.longitude.toFixed(4)}°E (APPROX)
            </div>
          </div>

          {/* Distance & Bearing */}
          <div className="font-mono">
            <div className="text-[10px] text-slate-400 uppercase">RANGE & BEARING</div>
            <div className="text-xs font-bold text-ocean-cyan mt-0.5 flex items-center gap-1">
              <Compass className="w-3 h-3" />
              <span>{detection.distance_km} km</span>
            </div>
            <div className="text-[10px] text-slate-400">
              BEARING: {detection.bearing.toFixed(0)}°
            </div>
          </div>
        </div>

        {/* Right Column: Risk Gauge & Investigate CTA */}
        <div className="flex sm:flex-row lg:flex-col items-center justify-between lg:justify-center gap-3">
          <div className="text-center font-mono">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">INVESTIGATION PRIORITY</div>
            <div className={`text-3xl font-black ${riskColor}`}>
              {detection.risk_score} <span className="text-sm font-normal text-slate-400">/ 100</span>
            </div>
            <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400 font-mono mt-0.5">
              <Hash className="w-3 h-3" />
              <span>SHA-256 VERIFIED</span>
            </div>
          </div>

          <button
            onClick={() => onInvestigate(detection.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-ocean-cyan hover:bg-ocean-cyan/90 text-ocean-950 shadow-glow-cyan transition-all hover:scale-105 active:scale-95"
          >
            <span>INVESTIGATE EVENT</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
