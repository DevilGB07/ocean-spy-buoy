import React, { useState } from 'react';
import { Play, AlertCircle, ShieldAlert, CheckCircle2, RotateCcw, Loader2 } from 'lucide-react';
import { triggerSimulation, resetSimulationData } from '../services/api';

interface SimulationControlBarProps {
  onSimulationTriggered?: () => void;
}

export const SimulationControlBar: React.FC<SimulationControlBarProps> = ({
  onSimulationTriggered
}) => {
  const [loadingScenario, setLoadingScenario] = useState<string | null>(null);
  const [lastActionStatus, setLastActionStatus] = useState<string | null>(null);

  const handleTrigger = async (scenario: 'normal' | 'mismatch' | 'dark-vessel') => {
    try {
      setLoadingScenario(scenario);
      setLastActionStatus(`Running ${scenario.toUpperCase()} pipeline...`);
      await triggerSimulation(scenario);
      setLastActionStatus(`Executed ${scenario.toUpperCase()} scenario successfully`);
      if (onSimulationTriggered) onSimulationTriggered();
    } catch (err: any) {
      setLastActionStatus(`Error: ${err.message}`);
    } finally {
      setLoadingScenario(null);
      setTimeout(() => setLastActionStatus(null), 4000);
    }
  };

  const handleReset = async () => {
    try {
      setLoadingScenario('reset');
      await resetSimulationData();
      setLastActionStatus('Reset & re-seeded simulated telemetry');
      if (onSimulationTriggered) onSimulationTriggered();
    } catch (err: any) {
      setLastActionStatus(`Error resetting: ${err.message}`);
    } finally {
      setLoadingScenario(null);
      setTimeout(() => setLastActionStatus(null), 3000);
    }
  };

  return (
    <div className="bg-ocean-900/90 border-b border-ocean-border/80 px-4 py-2.5 backdrop-blur">
      <div className="max-w-[1700px] mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Scenario Header */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-ocean-cyan/10 border border-ocean-cyan/30 text-ocean-cyan">
            <Play className="w-3.5 h-3.5 fill-current" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
              Tactical Simulation Scenarios
            </span>
            <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
              (Autonomous end-to-end sensor fusion pipeline)
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Normal Vessel */}
          <button
            onClick={() => handleTrigger('normal')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400 hover:shadow-glow-green transition-all disabled:opacity-50"
            title="Scenario 1: Verified Tanker (91% AI confidence) with matching AIS nearby"
          >
            {loadingScenario === 'normal' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>SIMULATE NORMAL VESSEL</span>
          </button>

          {/* AIS Mismatch */}
          <button
            onClick={() => handleTrigger('mismatch')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-amber-950/40 border border-amber-500/50 text-amber-300 hover:bg-amber-900/50 hover:border-amber-400 hover:shadow-glow-amber transition-all disabled:opacity-50"
            title="Scenario 2: Tanker acoustic signature with nearby Cargo AIS broadcast"
          >
            {loadingScenario === 'mismatch' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>SIMULATE AIS MISMATCH</span>
          </button>

          {/* Dark Vessel (The 3-Minute Demo Benchmark) */}
          <button
            onClick={() => handleTrigger('dark-vessel')}
            disabled={loadingScenario !== null}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold bg-rose-950/60 border-2 border-rose-500 text-rose-200 hover:bg-rose-900/80 hover:border-rose-400 shadow-glow-red transition-all animate-pulse hover:animate-none disabled:opacity-50"
            title="Scenario 3: Tanker acoustic signature + Camera confirmation + No AIS match (Risk: 82/100)"
          >
            {loadingScenario === 'dark-vessel' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            )}
            <span>SIMULATE DARK VESSEL</span>
          </button>

          <div className="h-4 w-px bg-ocean-border mx-1"></div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            disabled={loadingScenario !== null}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-ocean-800 border border-ocean-border transition-all disabled:opacity-50"
            title="Reset simulation data to default state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {lastActionStatus && (
        <div className="max-w-[1700px] mx-auto mt-1 text-[11px] font-mono text-ocean-cyan animate-fade-in">
          &gt; {lastActionStatus}
        </div>
      )}
    </div>
  );
};
