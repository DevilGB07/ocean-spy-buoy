import React, { useState } from 'react';
import { Alert } from '../types';
import { AlertTriangle, ShieldAlert, Check, ArrowRight } from 'lucide-react';

interface AlertsPageProps {
  alerts: Alert[];
  onAcknowledgeAlert: (id: number) => void;
  onSelectDetection: (detectionId: number) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  onAcknowledgeAlert,
  onSelectDetection,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const filtered = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'HIGH') return a.severity === 'HIGH';
    if (filter === 'DARK') return a.type === 'POSSIBLE_DARK_VESSEL';
    if (filter === 'MISMATCH') return a.type === 'PHYSICAL_AIS_MISMATCH';
    if (filter === 'UNACKNOWLEDGED') return !a.acknowledged;
    return true;
  });

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1700px] mx-auto font-mono">
      {/* Header & Filter Chips */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-ocean-900 border border-ocean-border rounded-xl p-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Surveillance Alert Triage Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Flagged physical vs broadcast discrepancies and priority investigation notices.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-ocean-950 p-1 rounded-lg border border-ocean-border text-xs">
          {['ALL', 'CRITICAL', 'HIGH', 'DARK', 'MISMATCH', 'UNACKNOWLEDGED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded transition-all text-xs ${
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

      {/* Alerts Table */}
      <div className="bg-ocean-900 border border-ocean-border rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-ocean-border text-slate-400 text-[10px] uppercase">
              <th className="py-3">Time</th>
              <th>Incident Ref</th>
              <th>Alert Classification</th>
              <th>Severity</th>
              <th>Risk Score</th>
              <th>Status</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ocean-border/40">
            {filtered.map((a) => {
              const isCritical = a.severity === 'CRITICAL';
              return (
                <tr key={a.id} className="hover:bg-ocean-800/40 transition-colors">
                  <td className="py-3 text-slate-300">
                    {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="text-ocean-cyan font-bold">DET-{a.detection_id}</td>
                  <td>
                    <div className="font-bold text-slate-100">{a.type.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-slate-400 font-sans max-w-md truncate">{a.message}</div>
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isCritical ? 'bg-rose-500 text-white shadow-glow-red' : 'bg-amber-500 text-black'
                    }`}>
                      {a.severity}
                    </span>
                  </td>
                  <td className="font-bold text-slate-100">
                    {a.risk_score} / 100
                  </td>
                  <td>
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      a.acknowledged ? 'bg-slate-800 text-slate-400' : 'bg-emerald-500/20 text-emerald-400 font-bold'
                    }`}>
                      {a.acknowledged ? 'ACKNOWLEDGED' : 'ACTIVE'}
                    </span>
                  </td>
                  <td className="text-right space-x-2">
                    {!a.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlert(a.id)}
                        className="px-2 py-1 rounded bg-ocean-800 hover:bg-ocean-700 text-slate-200 text-[11px] inline-flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Ack</span>
                      </button>
                    )}
                    <button
                      onClick={() => onSelectDetection(a.detection_id)}
                      className="px-2.5 py-1 rounded bg-ocean-cyan text-black font-bold text-[11px] inline-flex items-center gap-1 hover:bg-ocean-cyan/80"
                    >
                      <span>Investigate</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
