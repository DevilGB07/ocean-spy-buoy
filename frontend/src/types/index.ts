export interface Buoy {
  id: string;
  name: string;
  latitude: float;
  longitude: float;
  status: 'ONLINE' | 'OFFLINE' | 'WARNING';
  battery_level: number;
  last_seen: string;
  firmware_version: string;
  detection_radius_km: number;
  hydrophone_health: string;
}

export type float = number;

export interface Detection {
  id: number;
  buoy_id: string;
  timestamp: string;
  vessel_type: 'Tanker' | 'Cargo' | 'Fishing' | 'Passenger' | 'Background' | string;
  confidence: number;
  latitude: number;
  longitude: number;
  distance_km: number;
  bearing: number;
  audio_source: string;
  audio_level_db: number;
  dominant_frequency_hz: number;
  camera_confirmed: boolean;
  camera_image_url?: string | null;
  ais_status: 'VERIFIED' | 'PHYSICAL_AIS_MISMATCH' | 'NO_AIS_MATCH' | string;
  ais_matched_mmsi?: string | null;
  ais_matched_type?: string | null;
  risk_score: number;
  status: 'VERIFIED_VESSEL' | 'PHYSICAL_AIS_MISMATCH' | 'POSSIBLE_DARK_VESSEL' | string;
  reasons: string;
  reasons_list?: string[];
  recommendation: string;
  buoy?: Buoy;
}

export interface AISVessel {
  id: number;
  mmsi: string;
  name: string;
  vessel_type: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

export interface Alert {
  id: number;
  detection_id: number;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk_score: number;
  message: string;
  reasons: string;
  reasons_list?: string[];
  created_at: string;
  acknowledged: boolean;
  detection?: Detection;
}

export interface EvidenceRecord {
  id: number;
  detection_id: number;
  canonical_payload: string;
  sha256_hash: string;
  signature?: string;
  public_key?: string;
  created_at: string;
}

export interface EvidenceVerifyResult {
  valid: boolean;
  status_message: string;
  computed_sha256: string;
  stored_sha256: string;
  signature_valid: boolean;
  verified_at: string;
}

export interface AnalyticsData {
  total_detections: number;
  verified_count: number;
  mismatch_count: number;
  dark_vessel_count: number;
  active_alerts_count: number;
  high_risk_count: number;
  average_confidence: number;
  vessel_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  timeline_stats: Array<{
    time: string;
    detections: number;
    alerts: number;
  }>;
}

export interface SystemSettings {
  MAX_DISTANCE_KM: number;
  MAX_TIME_DIFFERENCE_SECONDS: number;
  ALERT_HIGH_THRESHOLD: number;
  ALERT_CRITICAL_THRESHOLD: number;
  MODE: string;
}

export interface WebSocketEvent {
  event: string;
  detection?: Detection;
  evidence?: EvidenceRecord;
  alert?: Alert;
}
