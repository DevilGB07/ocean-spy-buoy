import React from 'react';
import { Waves, Cpu, MapPin, Radio, Eye, Gauge, Hash, CheckCircle } from 'lucide-react';
import { Detection } from '../types';

interface ForensicTimelineProps {
  detection: Detection;
}

export const ForensicTimeline: React.FC<ForensicTimelineProps> = ({ detection }) => {
  const baseTime = new Date(detection.timestamp);
  
  // Format seconds with offset for forensic step recreation
  const formatTimeOffset = (secondsOffset: number) => {
    const t = new Date(baseTime.getTime() + secondsOffset * 1000);
    return t.toISOString().substring(11, 19);
  };

  const steps = [
    {
      time: formatTimeOffset(0),
      icon: Waves,
      title: 'Acoustic Signal Ingest',
      desc: `Raw hydrophone hydroacoustic pulse registered (${detection.audio_source || '48kHz Array'}). Energy: ${detection.audio_level_db.toFixed(1)} dBFS.`
    },
    {
      time: formatTimeOffset(1),
      icon: Cpu,
      title: 'AI TinyML Classification',
      desc: `Neural model classified engine acoustics as '${detection.vessel_type}' with ${Math.round(detection.confidence * 100)}% confidence score.`
    },
    {
      time: formatTimeOffset(2),
      icon: MapPin,
      title: 'Geodetic Localization',
      desc: `Bearing calculated at ${detection.bearing.toFixed(1)}° at range ${detection.distance_km.toFixed(2)} km. Estimated coords: ${detection.latitude.toFixed(4)}°N, ${detection.longitude.toFixed(4)}°E.`
    },
    {
      time: formatTimeOffset(3),
      icon: Radio,
      title: 'AIS Spatial/Temporal Cross-Match',
      desc: `Queried AIS transponder records within 5.0 km radius. Result: ${detection.ais_status.replace(/_/g, ' ')} ${detection.ais_matched_mmsi ? `(MMSI: ${detection.ais_matched_mmsi})` : '(No AIS targets in sector)'}.`
    },
    {
      time: formatTimeOffset(4),
      icon: Eye,
      title: 'Optical Camera Confirmation',
      desc: detection.camera_confirmed 
        ? 'Mast camera locked target silhouette and confirmed surface vessel presence.'
        : 'No visual contact established (optical channel unconfirmed).'
    },
    {
      time: formatTimeOffset(5),
      icon: Gauge,
      title: 'Sensor Fusion & Risk Scoring',
      desc: `Combined multi-sensor matrices yielded Investigation Priority score: ${detection.risk_score}/100 (${detection.status.replace(/_/g, ' ')}).`
    },
    {
      time: formatTimeOffset(6),
      icon: Hash,
      title: 'Canonical SHA-256 Hashing',
      desc: 'Canonical JSON serialized deterministically and hashed with SHA-256 digest for non-repudiation.'
    },
    {
      time: formatTimeOffset(7),
      icon: CheckCircle,
      title: 'ECDSA Digital Signing',
      desc: 'Cryptographic signature generated via NIST P-256 keypair and committed to immutable evidence ledger.'
    }
  ];

  return (
    <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5">
      <div className="flex items-center gap-2 border-b border-ocean-border/60 pb-3 mb-4">
        <Cpu className="w-4 h-4 text-ocean-cyan" />
        <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
          Autonomous Surveillance Execution Timeline
        </h3>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-ocean-border">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={idx} className="relative flex items-start gap-3">
              <div className="absolute -left-6 mt-0.5 w-5 h-5 rounded-full bg-ocean-950 border-2 border-ocean-cyan flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-ocean-cyan"></div>
              </div>

              <div className="flex-1 bg-ocean-950/70 border border-ocean-border/60 rounded-lg p-3 text-xs font-mono">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-ocean-cyan font-bold flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    {step.title}
                  </span>
                  <span className="text-slate-400 text-[11px]">{step.time} UTC</span>
                </div>
                <p className="text-slate-300 font-sans text-xs mt-1">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
