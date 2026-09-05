import React from 'react';
import { Buoy } from '../types';
import { Anchor, BatteryCharging, Radio, Shield, Activity, Cpu } from 'lucide-react';

interface BuoysPageProps {
  buoys: Buoy[];
}

export const BuoysPage: React.FC<BuoysPageProps> = ({ buoys }) => {
  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1700px] mx-auto font-mono">
      {/* Header */}
      <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Anchor className="w-5 h-5 text-ocean-cyan" />
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Ocean Spy-Buoy Autonomous Fleet Telemetry
            </h1>
          </div>
          <span className="px-2.5 py-1 rounded bg-ocean-cyan/10 border border-ocean-cyan/30 text-ocean-cyan font-bold text-xs">
            {buoys.length} SENSOR NODES ACTIVE
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans">
          Moored passive hydrophone sensor buoys equipped with TinyML edge microcontrollers, optical cameras, and satcom/LoRa gateways.
        </p>
      </div>

      {/* Buoy Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {buoys.map((buoy) => {
          const isOnline = buoy.status === 'ONLINE';

          return (
            <div
              key={buoy.id}
              className="bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-4 hover:border-ocean-cyan/50 transition-all backdrop-blur"
            >
              {/* Card Top */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">NODE IDENTIFIER</span>
                  <h3 className="text-lg font-bold text-slate-100">{buoy.id}</h3>
                  <div className="text-xs text-ocean-cyan font-medium truncate max-w-[200px]">
                    {buoy.name}
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                  isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {buoy.status}
                </span>
              </div>

              {/* Specs & Health */}
              <div className="bg-ocean-950 p-3 rounded-lg border border-ocean-border/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    Battery Reserve:
                  </span>
                  <strong className="text-emerald-400">{buoy.battery_level.toFixed(1)}%</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-ocean-cyan" />
                    Hydrophone Health:
                  </span>
                  <span className="text-slate-200">{buoy.hydrophone_health}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-blue-400" />
                    Detection Radius:
                  </span>
                  <span className="text-slate-200">{buoy.detection_radius_km} km</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-400" />
                    Firmware:
                  </span>
                  <span className="text-slate-300">{buoy.firmware_version}</span>
                </div>
              </div>

              {/* Geodetic Coords */}
              <div className="text-xs text-slate-400 space-y-1">
                <div>POSITION: <strong className="text-slate-200">{buoy.latitude.toFixed(4)}°N, {buoy.longitude.toFixed(4)}°E</strong></div>
                <div className="text-[11px] text-slate-500">
                  Last Telemetry: {new Date(buoy.last_seen).toLocaleTimeString()} UTC
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
