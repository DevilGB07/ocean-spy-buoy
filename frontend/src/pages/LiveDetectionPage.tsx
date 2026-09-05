import React, { useState, useEffect } from 'react';
import { Detection, Buoy } from '../types';
import { AcousticWaveformPanel } from '../components/AcousticWaveformPanel';
import { triggerSimulation } from '../services/api';
import { Play, Square, Activity, Eye, Radio, ShieldAlert, Compass, MapPin } from 'lucide-react';

interface LiveDetectionPageProps {
  latestDetection: Detection | null;
  buoys: Buoy[];
  onSelectDetection: (id: number) => void;
}

export const LiveDetectionPage: React.FC<LiveDetectionPageProps> = ({
  latestDetection,
  buoys,
  onSelectDetection,
}) => {
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLooping) {
      interval = setInterval(() => {
        const scenarios: Array<'normal' | 'mismatch' | 'dark-vessel'> = ['normal', 'mismatch', 'dark-vessel'];
        const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        triggerSimulation(randomScenario).catch(console.error);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isLooping]);

  const activeBuoy = buoys.find((b) => b.id === latestDetection?.buoy_id) || buoys[0];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1700px] mx-auto">
      {/* Live Header & Loop Simulator Control */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-ocean-900 border border-ocean-border rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <h1 className="text-base font-mono font-bold text-slate-100 uppercase tracking-wider">
              Live Acoustic Surveillance & Telemetry Feed
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Real-time passive sonar listening post. Sensor node: {activeBuoy?.name || 'OSB-001'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-xs font-bold transition-all ${
              isLooping
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-glow-red animate-pulse'
                : 'bg-ocean-cyan hover:bg-ocean-cyan/90 text-ocean-950 shadow-glow-cyan'
            }`}
          >
            {isLooping ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>STOP CONTINUOUS STREAM</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>START CONTINUOUS STREAM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Large Acoustic Panel */}
      <div>
        <AcousticWaveformPanel detection={latestDetection} />
      </div>

      {/* Multi-Sensor Intelligence Matrix */}
      {latestDetection && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: AI Classification & Physics */}
          <div className="bg-ocean-900 border border-ocean-border rounded-xl p-4 font-mono space-y-3">
            <div className="text-xs font-bold text-ocean-cyan flex items-center gap-2 border-b border-ocean-border/60 pb-2">
              <Activity className="w-4 h-4" />
              <span>AI HYDROACOUSTIC SIGNATURE</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Classified Vessel:</span>
                <strong className="text-slate-100 uppercase">{latestDetection.vessel_type}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">TinyML Confidence:</span>
                <strong className="text-ocean-cyan">{Math.round(latestDetection.confidence * 100)}%</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Inference Model:</span>
                <span className="text-slate-300">OceanSpy-TinyML-Demo</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cavitation Noise:</span>
                <span className="text-slate-300">{latestDetection.audio_level_db.toFixed(1)} dBFS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Dominant Frequency:</span>
                <span className="text-slate-300">{latestDetection.dominant_frequency_hz.toFixed(1)} Hz</span>
              </div>
            </div>
          </div>

          {/* Card 2: AIS & Optical Fusion */}
          <div className="bg-ocean-900 border border-ocean-border rounded-xl p-4 font-mono space-y-3">
            <div className="text-xs font-bold text-amber-400 flex items-center gap-2 border-b border-ocean-border/60 pb-2">
              <Radio className="w-4 h-4" />
              <span>AIS & OPTICAL CORRELATION</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">AIS Status:</span>
                <strong className={
                  latestDetection.ais_status === 'NO_AIS_MATCH' ? 'text-rose-400' :
                  latestDetection.ais_status === 'PHYSICAL_AIS_MISMATCH' ? 'text-amber-400' : 'text-emerald-400'
                }>
                  {latestDetection.ais_status.replace(/_/g, ' ')}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">AIS Target MMSI:</span>
                <span className="text-slate-300">{latestDetection.ais_matched_mmsi || 'None within perimeter'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Optical Camera:</span>
                <strong className={latestDetection.camera_confirmed ? 'text-ocean-cyan' : 'text-slate-400'}>
                  {latestDetection.camera_confirmed ? 'CONFIRMED ON SURFACE' : 'UNCONFIRMED'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Optical Sensor ID:</span>
                <span className="text-slate-300">Mast Cam-4K (Opto-IR)</span>
              </div>
            </div>
          </div>

          {/* Card 3: Geodetics & Risk Priority */}
          <div className="bg-ocean-900 border border-ocean-border rounded-xl p-4 font-mono space-y-3">
            <div className="text-xs font-bold text-rose-400 flex items-center gap-2 border-b border-ocean-border/60 pb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>LOCALIZATION & RISK PRIORITY</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Approximate Location:</span>
                <span className="text-slate-200">{latestDetection.latitude.toFixed(4)}°N, {latestDetection.longitude.toFixed(4)}°E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Distance from Node:</span>
                <span className="text-slate-200">{latestDetection.distance_km} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">True Bearing:</span>
                <span className="text-slate-200">{latestDetection.bearing.toFixed(0)}°</span>
              </div>
              <div className="flex justify-between border-t border-ocean-border/60 pt-1">
                <span className="text-slate-400">Investigation Priority:</span>
                <strong className={`text-base ${
                  latestDetection.risk_score >= 80 ? 'text-rose-400' :
                  latestDetection.risk_score >= 60 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {latestDetection.risk_score} / 100
                </strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
