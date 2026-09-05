import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../types';
import { getSettings, updateSettings } from '../services/api';
import { Settings as SettingsIcon, Save, RefreshCw, CheckCircle, ShieldCheck } from 'lucide-react';

interface SettingsPageProps {
  isWsConnected: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ isWsConnected }) => {
  const [settings, setSettings] = useState<SystemSettings>({
    MAX_DISTANCE_KM: 5.0,
    MAX_TIME_DIFFERENCE_SECONDS: 120,
    ALERT_HIGH_THRESHOLD: 60,
    ALERT_CRITICAL_THRESHOLD: 80,
    MODE: 'SIMULATION'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateSettings(settings);
      setStatusMsg('System thresholds successfully updated in memory.');
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg(`Error saving settings: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-ocean-cyan" />
        LOADING SYSTEM CONFIGURATION...
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-[1200px] mx-auto font-mono">
      {/* Header */}
      <div className="bg-ocean-900 border border-ocean-border rounded-xl p-5 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-ocean-cyan" />
            <h1 className="text-base font-bold text-slate-100 uppercase tracking-wider">
              Surveillance Thresholds & Sensor Configuration
            </h1>
          </div>
          <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-xs">
            HACKATHON MVP CONFIG
          </span>
        </div>
        <p className="text-xs text-slate-400 font-sans">
          Fine-tune spatial correlation radii, temporal deltas, and risk engine prioritization parameters.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="bg-ocean-900 border border-ocean-border rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Setting 1: AIS Distance */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold uppercase">
              Max AIS Correlation Distance (km)
            </label>
            <p className="text-[11px] text-slate-400 font-sans">
              Maximum physical distance from estimated acoustic target to consider an AIS transponder matching.
            </p>
            <input
              type="number"
              step="0.1"
              value={settings.MAX_DISTANCE_KM}
              onChange={(e) => setSettings({ ...settings, MAX_DISTANCE_KM: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 rounded bg-ocean-950 border border-ocean-border text-slate-100 focus:border-ocean-cyan focus:outline-none"
            />
          </div>

          {/* Setting 2: AIS Time Window */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold uppercase">
              Max AIS Temporal Delta (Seconds)
            </label>
            <p className="text-[11px] text-slate-400 font-sans">
              Maximum allowable age difference between acoustic ping and AIS vessel report.
            </p>
            <input
              type="number"
              value={settings.MAX_TIME_DIFFERENCE_SECONDS}
              onChange={(e) => setSettings({ ...settings, MAX_TIME_DIFFERENCE_SECONDS: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded bg-ocean-950 border border-ocean-border text-slate-100 focus:border-ocean-cyan focus:outline-none"
            />
          </div>

          {/* Setting 3: High Alert Threshold */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold uppercase">
              Alert Trigger Threshold (High Priority)
            </label>
            <p className="text-[11px] text-slate-400 font-sans">
              Minimum risk score (0-100) required to trigger a High Priority security alert.
            </p>
            <input
              type="number"
              value={settings.ALERT_HIGH_THRESHOLD}
              onChange={(e) => setSettings({ ...settings, ALERT_HIGH_THRESHOLD: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded bg-ocean-950 border border-ocean-border text-slate-100 focus:border-ocean-cyan focus:outline-none"
            />
          </div>

          {/* Setting 4: Critical Alert Threshold */}
          <div className="space-y-2">
            <label className="block text-slate-300 font-bold uppercase">
              Critical Alert Threshold
            </label>
            <p className="text-[11px] text-slate-400 font-sans">
              Minimum risk score to escalate detection to Critical / Urgent Investigation level.
            </p>
            <input
              type="number"
              value={settings.ALERT_CRITICAL_THRESHOLD}
              onChange={(e) => setSettings({ ...settings, ALERT_CRITICAL_THRESHOLD: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded bg-ocean-950 border border-ocean-border text-slate-100 focus:border-ocean-cyan focus:outline-none"
            />
          </div>
        </div>

        {/* Diagnostics Info */}
        <div className="bg-ocean-950 p-4 rounded-lg border border-ocean-border/60 text-xs space-y-2">
          <div className="text-slate-400 font-bold uppercase">System Diagnostics</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div>WebSocket Gateway: <strong className={isWsConnected ? 'text-emerald-400' : 'text-rose-400'}>{isWsConnected ? 'ONLINE' : 'DISCONNECTED'}</strong></div>
            <div>Database Engine: <strong className="text-slate-200">SQLite 3 (WAL mode)</strong></div>
            <div>AI Classification: <strong className="text-ocean-cyan">TinyML Simulation Pipeline</strong></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-lg bg-ocean-cyan hover:bg-ocean-cyan/90 text-ocean-950 font-bold text-xs flex items-center gap-2 shadow-glow-cyan transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'SAVING THRESHOLDS...' : 'SAVE THRESHOLDS'}</span>
          </button>

          {statusMsg && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              <span>{statusMsg}</span>
            </span>
          )}
        </div>
      </form>
    </div>
  );
};
