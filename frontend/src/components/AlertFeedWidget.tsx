import React from 'react';
import { AlertTriangle, ShieldAlert, Check, ArrowRight } from 'lucide-react';
import { Alert } from '../types';

interface AlertFeedWidgetProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: number) => void;
  onInvestigate?: (detectionId: number) => void;
}

export const AlertFeedWidget: React.FC<AlertFeedWidgetProps> = ({
  alerts,
  onAcknowledge,
  onInvestigate,
}) => {
  return (
    <div className="bg-ocean-900 border border-ocean-border rounded-xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-ocean-border/60 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
            Active Security Alerts
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ocean-800 text-slate-300">
          {alerts.filter(a => !a.acknowledged).length} PENDING
        </span>
      </div>

      <div className="space-y-2.5 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-xs font-mono text-slate-400">
            No active alerts. All physical signals normal.
          </div>
        ) : (
          alerts.slice(0, 10).map((alert) => {
            const isCritical = alert.severity === 'CRITICAL';
            const isHigh = alert.severity === 'HIGH';

            return (
              <div
                key={alert.id}
                className={`p-3 rounded-lg border transition-all text-xs font-mono ${
                  alert.acknowledged
                    ? 'bg-ocean-950/40 border-ocean-border/40 opacity-60'
                    : isCritical
                      ? 'bg-rose-950/30 border-rose-500/50 hover:border-rose-400'
                      : isHigh
                        ? 'bg-amber-950/30 border-amber-500/50 hover:border-amber-400'
                        : 'bg-ocean-950 border-ocean-border'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {isCritical ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span className={`font-bold ${isCritical ? 'text-rose-300' : 'text-amber-300'}`}>
                      {alert.type.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    isCritical ? 'bg-rose-500 text-white' : 'bg-amber-500 text-black'
                  }`}>
                    RISK {alert.risk_score}
                  </span>
                </div>

                <p className="text-[11px] text-slate-300 font-sans mt-1 line-clamp-2">
                  {alert.message}
                </p>

                <div className="mt-2 pt-2 border-t border-ocean-border/40 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">
                    {new Date(alert.created_at).toLocaleTimeString()}
                  </span>

                  <div className="flex items-center gap-2">
                    {!alert.acknowledged && onAcknowledge && (
                      <button
                        onClick={() => onAcknowledge(alert.id)}
                        className="px-2 py-0.5 rounded bg-ocean-800 hover:bg-ocean-700 text-slate-300 hover:text-white flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>ACK</span>
                      </button>
                    )}

                    {onInvestigate && (
                      <button
                        onClick={() => onInvestigate(alert.detection_id)}
                        className="px-2 py-0.5 rounded bg-ocean-cyan/20 hover:bg-ocean-cyan/30 text-ocean-cyan flex items-center gap-1 font-bold"
                      >
                        <span>DETAILS</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
