import React from 'react';
import { Buoy, Detection, AISVessel, Alert } from '../types';
import { HeroThreatCard } from '../components/HeroThreatCard';
import { MetricCard } from '../components/MetricCard';
import { LeafletMap } from '../components/LeafletMap';
import { AlertFeedWidget } from '../components/AlertFeedWidget';
import { AcousticWaveformPanel } from '../components/AcousticWaveformPanel';
import { Anchor, Ship, Radio, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';

interface DashboardPageProps {
  buoys: Buoy[];
  detections: Detection[];
  aisVessels: AISVessel[];
  alerts: Alert[];
  latestDetection: Detection | null;
  onSelectDetection: (id: number) => void;
  onAcknowledgeAlert: (id: number) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  buoys,
  detections,
  aisVessels,
  alerts,
  latestDetection,
  onSelectDetection,
  onAcknowledgeAlert,
  onNavigateTab,
}) => {
  // Compute KPI metrics
  const activeBuoysCount = buoys.filter((b) => b.status === 'ONLINE').length;
  const vesselsDetectedCount = detections.length;
  const aisMatchesCount = detections.filter((d) => d.ais_status === 'VERIFIED').length;
  const activeAlertsCount = alerts.filter((a) => !a.acknowledged).length;
  const highRiskEventsCount = detections.filter((d) => d.risk_score >= 60).length;

  return (
    <div className="space-y-5 p-4 md:p-6 max-w-[1700px] mx-auto">
      {/* 1. Hero Threat Event Banner (Section 37) */}
      <section>
        <HeroThreatCard
          detection={latestDetection || detections[0] || null}
          onInvestigate={onSelectDetection}
        />
      </section>

      {/* 2. Main KPI Statistics Grid (Section 6) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard
          title="Active Buoys"
          value={activeBuoysCount}
          subtitle="All Sentinel nodes online"
          icon={Anchor}
          variant="cyan"
        />
        <MetricCard
          title="Vessels Detected"
          value={vesselsDetectedCount}
          subtitle="Hydrophone acoustic events"
          icon={Ship}
          variant="blue"
        />
        <MetricCard
          title="AIS Matches"
          value={aisMatchesCount}
          subtitle="Verified AIS transponders"
          icon={Radio}
          variant="green"
        />
        <MetricCard
          title="Active Alerts"
          value={activeAlertsCount}
          subtitle="Awaiting acknowledgment"
          icon={AlertTriangle}
          variant="amber"
        />
        <MetricCard
          title="High Risk Events"
          value={highRiskEventsCount}
          subtitle="Investigation Priority ≥ 60"
          icon={ShieldAlert}
          variant="red"
        />
      </section>

      {/* 3. Tactical Radar Map & Real-time Alert Feed Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <LeafletMap
            buoys={buoys}
            detections={detections}
            aisVessels={aisVessels}
            selectedDetection={latestDetection}
            onSelectDetection={onSelectDetection}
          />
        </div>

        <div className="lg:col-span-1">
          <AlertFeedWidget
            alerts={alerts}
            onAcknowledge={onAcknowledgeAlert}
            onInvestigate={onSelectDetection}
          />
        </div>
      </section>

      {/* 4. Acoustic Signal Processing & Recent Detections Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div>
          <AcousticWaveformPanel detection={latestDetection || detections[0] || null} />
        </div>

        {/* Recent Detections Quick Table */}
        <div className="bg-ocean-900 border border-ocean-border rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-ocean-border/60 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-ocean-cyan" />
                <h3 className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                  Recent Physical Sensing Stream
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('vessels')}
                className="text-[11px] font-mono text-ocean-cyan hover:underline flex items-center gap-1"
              >
                <span>VIEW ALL</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-ocean-border/80 text-slate-400 text-[10px] uppercase">
                    <th className="py-2">Time</th>
                    <th>Vessel</th>
                    <th>AI Conf</th>
                    <th>AIS Status</th>
                    <th>Risk</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ocean-border/40">
                  {detections.slice(0, 5).map((d) => (
                    <tr key={d.id} className="hover:bg-ocean-800/50 transition-colors">
                      <td className="py-2.5 text-slate-400">
                        {new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="font-bold text-slate-100">{d.vessel_type}</td>
                      <td className="text-ocean-cyan">{Math.round(d.confidence * 100)}%</td>
                      <td>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          d.ais_status === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300' :
                          d.ais_status === 'PHYSICAL_AIS_MISMATCH' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-rose-500/20 text-rose-300 font-bold'
                        }`}>
                          {d.ais_status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="font-bold">
                        <span className={d.risk_score >= 80 ? 'text-rose-400' : d.risk_score >= 60 ? 'text-amber-400' : 'text-emerald-400'}>
                          {d.risk_score}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => onSelectDetection(d.id)}
                          className="px-2 py-1 rounded bg-ocean-800 hover:bg-ocean-cyan hover:text-black text-slate-200 text-[10px] transition-all"
                        >
                          Forensic
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-ocean-border/60 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Independent physical verification layer active.</span>
            <span className="text-slate-500">Node: OSB-001 (Hydrophone Array A)</span>
          </div>
        </div>
      </section>
    </div>
  );
};
