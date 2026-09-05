import {
  Buoy,
  Detection,
  AISVessel,
  Alert,
  EvidenceRecord,
  EvidenceVerifyResult,
  AnalyticsData,
  SystemSettings
} from '../types';

const API_BASE = '/api/v1';

export async function getHealth(): Promise<{ status: string; mode: string; version: string; tagline: string; active_buoy: string }> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function getBuoys(): Promise<Buoy[]> {
  const res = await fetch(`${API_BASE}/buoys`);
  if (!res.ok) throw new Error('Failed to fetch buoys');
  return res.json();
}

export async function getDetections(status?: string, limit = 50): Promise<Detection[]> {
  const url = new URL(`${API_BASE}/detections`, window.location.origin);
  if (status) url.searchParams.append('status', status);
  url.searchParams.append('limit', limit.toString());
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch detections');
  return res.json();
}

export async function getDetection(id: number): Promise<Detection> {
  const res = await fetch(`${API_BASE}/detections/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch detection #${id}`);
  return res.json();
}

export async function getAISVessels(): Promise<AISVessel[]> {
  const res = await fetch(`${API_BASE}/ais/vessels`);
  if (!res.ok) throw new Error('Failed to fetch AIS vessels');
  return res.json();
}

export async function getAlerts(severity?: string, acknowledged?: boolean): Promise<Alert[]> {
  const url = new URL(`${API_BASE}/alerts`, window.location.origin);
  if (severity) url.searchParams.append('severity', severity);
  if (acknowledged !== undefined) url.searchParams.append('acknowledged', acknowledged.toString());
  
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function acknowledgeAlert(id: number): Promise<Alert> {
  const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, { method: 'PATCH' });
  if (!res.ok) throw new Error(`Failed to acknowledge alert #${id}`);
  return res.json();
}

export async function getEvidenceList(): Promise<EvidenceRecord[]> {
  const res = await fetch(`${API_BASE}/evidence`);
  if (!res.ok) throw new Error('Failed to fetch evidence records');
  return res.json();
}

export async function getEvidence(id: number): Promise<EvidenceRecord> {
  const res = await fetch(`${API_BASE}/evidence/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch evidence #${id}`);
  return res.json();
}

export async function verifyEvidence(id: number): Promise<EvidenceVerifyResult> {
  const res = await fetch(`${API_BASE}/evidence/${id}/verify`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to verify evidence #${id}`);
  return res.json();
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function getSettings(): Promise<SystemSettings> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(settings: SystemSettings): Promise<SystemSettings> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}

export async function triggerSimulation(scenario: 'normal' | 'mismatch' | 'dark-vessel'): Promise<any> {
  const res = await fetch(`${API_BASE}/simulation/${scenario}`, { method: 'POST' });
  if (!res.ok) throw new Error(`Failed to trigger simulation scenario: ${scenario}`);
  return res.json();
}

export async function resetSimulationData(): Promise<any> {
  const res = await fetch(`${API_BASE}/simulation/seed`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reset simulation data');
  return res.json();
}
