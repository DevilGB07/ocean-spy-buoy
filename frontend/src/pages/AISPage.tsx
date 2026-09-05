import React from 'react';
import { AISVessel } from '../types';
import { Radio, ShieldAlert, Compass, Navigation } from 'lucide-react';

interface AISPageProps {
  aisVessels: AISVessel[];
}

export const AISPage: React.FC<AISPageProps> = ({ aisVessels }) => {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1700px] mx-auto font-mono">
      {/* Header with Disclaimer */}
      <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-ocean-cyan" />
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Automatic Identification System (AIS) Transponder Feeds
            </h1>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
            SIMULATED AIS MODE
          </span>
        </div>

        <div className="bg-ocean-950 p-3 rounded-lg border border-ocean-border/60 text-xs text-slate-400 flex items-start gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p>
            <strong>OPERATIONAL NOTICE:</strong> AIS data displayed on this interface is generated via synthetic maritime telemetry for prototype demonstration.
            An AIS mismatch indicates physical sensory discrepancy requiring investigation, and is never an assertion of unlawful activity.
          </p>
        </div>
      </div>

      {/* AIS Vessels Table */}
      <div className="bg-ocean-900 border border-ocean-border rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-ocean-border text-slate-400 text-[10px] uppercase">
              <th className="py-3">MMSI</th>
              <th>Vessel Name</th>
              <th>Broadcast Type</th>
              <th>Coordinates</th>
              <th>Speed (kn)</th>
              <th>Heading</th>
              <th className="text-right">Transponder Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-border/40">
            {aisVessels.map((v) => (
              <tr key={v.id} className="hover:bg-ocean-800/40 transition-colors">
                <td className="py-3 text-ocean-cyan font-bold">{v.mmsi}</td>
                <td className="text-slate-100 font-bold">{v.name}</td>
                <td className="uppercase text-slate-300">{v.vessel_type}</td>
                <td className="text-slate-400">
                  {v.latitude.toFixed(4)}°N, {v.longitude.toFixed(4)}°E
                </td>
                <td className="text-slate-300">{v.speed.toFixed(1)} kn</td>
                <td className="text-slate-300">{v.heading.toFixed(0)}°</td>
                <td className="text-right">
                  <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    BROADCASTING
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
