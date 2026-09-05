import React, { useState } from 'react';
import { Detection } from '../types';
import { Ship, Search, Filter, ArrowRight } from 'lucide-react';

interface VesselsPageProps {
  detections: Detection[];
  onSelectDetection: (id: number) => void;
}

export const VesselsPage: React.FC<VesselsPageProps> = ({ detections, onSelectDetection }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  const filtered = detections.filter((d) => {
    const matchesFilter =
      filter === 'ALL' ? true :
      filter === 'VERIFIED' ? d.status === 'VERIFIED_VESSEL' :
      filter === 'MISMATCH' ? d.status === 'PHYSICAL_AIS_MISMATCH' :
      filter === 'DARK' ? d.status === 'POSSIBLE_DARK_VESSEL' : true;

    const matchesSearch =
      d.vessel_type.toLowerCase().includes(search.toLowerCase()) ||
      d.buoy_id.toLowerCase().includes(search.toLowerCase()) ||
      (d.ais_matched_mmsi && d.ais_matched_mmsi.includes(search));

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1700px] mx-auto font-mono">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-ocean-900 border border-ocean-border rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-ocean-cyan" />
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Physical Acoustic Vessel Detections
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Sensor-grounded hydrophone acoustic intelligence feed.
          </p>
        </div>

        {/* Filter Pills & Search Input */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search type / MMSI / Buoy..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-ocean-950 border border-ocean-border text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-ocean-cyan"
            />
          </div>

          <div className="flex items-center gap-1 bg-ocean-950 p-1 rounded-lg border border-ocean-border text-xs">
            {['ALL', 'VERIFIED', 'MISMATCH', 'DARK'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded transition-all ${
                  filter === f
                    ? 'bg-ocean-cyan text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detections Table */}
      <div className="bg-ocean-900 border border-ocean-border rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-ocean-border text-slate-400 text-[10px] uppercase">
              <th className="py-3">Timestamp</th>
              <th>Buoy ID</th>
              <th>Vessel Classification</th>
              <th>Confidence</th>
              <th>Range & Bearing</th>
              <th>AIS Status</th>
              <th>Investigation Priority</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-border/40">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-ocean-800/40 transition-colors">
                <td className="py-3 text-slate-300">
                  {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </td>
                <td className="text-ocean-cyan font-bold">{d.buoy_id}</td>
                <td className="font-bold text-slate-100 uppercase">{d.vessel_type}</td>
                <td className="text-ocean-cyan">{Math.round(d.confidence * 100)}%</td>
                <td className="text-slate-300">
                  {d.distance_km} km @ {d.bearing.toFixed(0)}°
                </td>
                <td>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    d.ais_status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-400' :
                    d.ais_status === 'PHYSICAL_AIS_MISMATCH' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-rose-500/20 text-rose-400'
                  }`}>
                    {d.ais_status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td>
                  <span className={`font-bold ${
                    d.risk_score >= 80 ? 'text-rose-400' :
                    d.risk_score >= 60 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {d.risk_score} / 100
                  </span>
                </td>
                <td className="text-right">
                  <button
                    onClick={() => onSelectDetection(d.id)}
                    className="px-2.5 py-1 rounded bg-ocean-800 hover:bg-ocean-cyan hover:text-black text-slate-200 transition-all text-[11px] font-bold inline-flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
