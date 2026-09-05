import React, { useState, useEffect, useCallback } from 'react';
import { TopStatusBar } from './layouts/TopStatusBar';
import { Navbar } from './layouts/Navbar';
import { SimulationControlBar } from './layouts/SimulationControlBar';
import { DashboardPage } from './pages/DashboardPage';
import { LiveDetectionPage } from './pages/LiveDetectionPage';
import { VesselsPage } from './pages/VesselsPage';
import { AISPage } from './pages/AISPage';
import { AlertsPage } from './pages/AlertsPage';
import { DetectionDetailPage } from './pages/DetectionDetailPage';
import { EvidencePage } from './pages/EvidencePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { BuoysPage } from './pages/BuoysPage';
import { SettingsPage } from './pages/SettingsPage';

import { useWebSocket } from './hooks/useWebSocket';
import { getBuoys, getDetections, getAISVessels, getAlerts, acknowledgeAlert } from './services/api';
import { Buoy, Detection, AISVessel, Alert, WebSocketEvent } from './types';
import { ShieldAlert, X, ArrowRight } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedDetectionId, setSelectedDetectionId] = useState<number | null>(null);

  const [buoys, setBuoys] = useState<Buoy[]>([]);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [aisVessels, setAISVessels] = useState<AISVessel[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [latestDetection, setLatestDetection] = useState<Detection | null>(null);
  
  // Tactical floating toast for new alerts
  const [activeToast, setActiveToast] = useState<{ title: string; desc: string; detectionId: number } | null>(null);

  // Fetch initial telemetry
  const refreshData = useCallback(async () => {
    try {
      const [bData, dData, aisData, aData] = await Promise.all([
        getBuoys(),
        getDetections(),
        getAISVessels(),
        getAlerts(),
      ]);
      setBuoys(bData);
      setDetections(dData);
      setAISVessels(aisData);
      setAlerts(aData);
      if (dData.length > 0) {
        setLatestDetection(dData[0]);
      }
    } catch (err) {
      console.error('Error refreshing system data:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // WebSocket event handler
  const handleWebSocketEvent = useCallback((event: WebSocketEvent) => {
    if (event.event === 'DETECTION_PIPELINE_COMPLETE' && event.detection) {
      const newDet = event.detection;
      setLatestDetection(newDet);
      setDetections((prev) => [newDet, ...prev.filter((d) => d.id !== newDet.id)]);

      if (event.alert) {
        const newAlert = event.alert;
        setAlerts((prev) => [newAlert, ...prev.filter((a) => a.id !== newAlert.id)]);

        // Show prominent toast for high risk
        if (newAlert.risk_score >= 60) {
          setActiveToast({
            title: `🚨 ${newAlert.type.replace(/_/g, ' ')}`,
            desc: newAlert.message,
            detectionId: newAlert.detection_id,
          });
        }
      }
    }
  }, []);

  const { isConnected } = useWebSocket(handleWebSocketEvent);

  const handleSelectDetection = (id: number) => {
    setSelectedDetectionId(id);
    setCurrentTab('detection-detail');
  };

  const handleAcknowledgeAlert = async (alertId: number) => {
    try {
      await acknowledgeAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
      );
    } catch (err) {
      console.error('Failed to ack alert:', err);
    }
  };

  const unacknowledgedAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-ocean-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Top System Status Bar */}
      <TopStatusBar isWsConnected={isConnected} activeBuoy="OSB-001" />

      {/* 2. Main Navigation Bar */}
      <Navbar
        currentTab={currentTab === 'detection-detail' ? 'dashboard' : currentTab}
        onSelectTab={(tab) => {
          setSelectedDetectionId(null);
          setCurrentTab(tab);
        }}
        activeAlertCount={unacknowledgedAlertsCount}
      />

      {/* 3. Tactical Simulation Toolbar (Always accessible) */}
      <SimulationControlBar onSimulationTriggered={refreshData} />

      {/* 4. Active Page Content */}
      <main className="flex-1 pb-12">
        {currentTab === 'dashboard' && (
          <DashboardPage
            buoys={buoys}
            detections={detections}
            aisVessels={aisVessels}
            alerts={alerts}
            latestDetection={latestDetection}
            onSelectDetection={handleSelectDetection}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onNavigateTab={(tab) => setCurrentTab(tab)}
          />
        )}

        {currentTab === 'live' && (
          <LiveDetectionPage
            latestDetection={latestDetection}
            buoys={buoys}
            onSelectDetection={handleSelectDetection}
          />
        )}

        {currentTab === 'vessels' && (
          <VesselsPage
            detections={detections}
            onSelectDetection={handleSelectDetection}
          />
        )}

        {currentTab === 'ais' && <AISPage aisVessels={aisVessels} />}

        {currentTab === 'alerts' && (
          <AlertsPage
            alerts={alerts}
            onAcknowledgeAlert={handleAcknowledgeAlert}
            onSelectDetection={handleSelectDetection}
          />
        )}

        {currentTab === 'detection-detail' && selectedDetectionId !== null && (
          <DetectionDetailPage
            detectionId={selectedDetectionId}
            onBack={() => setCurrentTab('dashboard')}
          />
        )}

        {currentTab === 'evidence' && <EvidencePage />}

        {currentTab === 'analytics' && <AnalyticsPage />}

        {currentTab === 'buoys' && <BuoysPage buoys={buoys} />}

        {currentTab === 'settings' && <SettingsPage isWsConnected={isConnected} />}
      </main>

      {/* Floating Tactical Alert Toast */}
      {activeToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-rose-950/90 border-2 border-rose-500 rounded-xl p-4 shadow-glow-red backdrop-blur animate-slide-up text-xs font-mono">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
              <span>{activeToast.title}</span>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-slate-200 font-sans mt-1.5 text-xs">
            {activeToast.desc}
          </p>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              onClick={() => {
                handleSelectDetection(activeToast.detectionId);
                setActiveToast(null);
              }}
              className="px-3 py-1.5 rounded bg-ocean-cyan text-black font-bold flex items-center gap-1 hover:bg-ocean-cyan/80"
            >
              <span>Investigate Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-ocean-border/60 bg-ocean-950 py-4 px-6 text-center text-xs font-mono text-slate-500">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-[1700px] mx-auto">
          <div>
            OCEAN SPY-BUOY © 2026 — <em>"Don't Ask the Ship Where It Is. Ask the Ocean."</em>
          </div>
          <div className="text-[11px] text-slate-500">
            Autonomous Hydrophone Layer • Prototype TinyML • Simulated AIS • SHA-256 Non-Repudiation
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
