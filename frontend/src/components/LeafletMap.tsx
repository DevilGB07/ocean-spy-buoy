import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Buoy, Detection, AISVessel } from '../types';
import { ArrowRight, Compass, Navigation } from 'lucide-react';

interface LeafletMapProps {
  buoys: Buoy[];
  detections: Detection[];
  aisVessels: AISVessel[];
  selectedDetection?: Detection | null;
  onSelectDetection?: (id: number) => void;
}

// Custom DivIcons for tactical appearance without broken external pngs
const createBuoyIcon = (name: string) =>
  L.divIcon({
    className: 'custom-buoy-icon',
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-8 h-8 rounded-full bg-cyan-400/20 animate-ping"></div>
        <div class="relative w-6 h-6 rounded-full bg-cyan-500 border-2 border-white shadow-lg flex items-center justify-center text-[10px] font-bold text-black">
          ⚓
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const createVesselIcon = (status: string, vesselType: string) => {
  let color = '#10B981'; // green verified
  let label = 'VERIFIED';
  let pulse = '';

  if (status === 'POSSIBLE_DARK_VESSEL' || status === 'NO_AIS_MATCH') {
    color = '#EF4444'; // red dark vessel
    label = 'DARK';
    pulse = '<div class="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping"></div>';
  } else if (status === 'PHYSICAL_AIS_MISMATCH') {
    color = '#F59E0B'; // yellow mismatch
    label = 'MISMATCH';
  }

  return L.divIcon({
    className: 'custom-vessel-icon',
    html: `
      <div class="relative flex items-center justify-center">
        ${pulse}
        <div style="background-color: ${color};" class="relative px-1.5 py-0.5 rounded shadow-lg border border-black/50 text-[9px] font-mono font-bold text-black flex items-center gap-0.5">
          <span>🚢</span>
          <span>${label}</span>
        </div>
      </div>
    `,
    iconSize: [60, 20],
    iconAnchor: [30, 10],
  });
};

const createAISIcon = (name: string, type: string) =>
  L.divIcon({
    className: 'custom-ais-icon',
    html: `
      <div class="relative px-1.5 py-0.5 rounded bg-slate-800/90 border border-slate-600 text-[9px] font-mono text-slate-300 shadow">
        📡 ${name.slice(0, 10)}
      </div>
    `,
    iconSize: [60, 18],
    iconAnchor: [30, 9],
  });

export const LeafletMap: React.FC<LeafletMapProps> = ({
  buoys,
  detections,
  aisVessels,
  selectedDetection,
  onSelectDetection,
}) => {
  // Center on Primary Buoy (Sentinel OSB-001)
  const defaultCenter: [number, number] = [19.0760, 72.8777];
  const activeBuoy = buoys.find((b) => b.id === 'OSB-001') || buoys[0];
  const center: [number, number] = activeBuoy
    ? [activeBuoy.latitude, activeBuoy.longitude]
    : defaultCenter;

  // Filter latest 8 unique detections to keep map readable
  const recentDetections = detections.slice(0, 8);

  return (
    <div className="relative w-full h-[450px] lg:h-[500px] rounded-xl overflow-hidden border border-ocean-border shadow-2xl bg-ocean-950">
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-ocean-950/80 backdrop-blur border border-ocean-border px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-ocean-cyan font-bold">
          <span className="w-2 h-2 rounded-full bg-ocean-cyan animate-pulse"></span>
          TACTICAL MARITIME RADAR
        </span>
        <span className="text-slate-500">|</span>
        <span className="text-[11px] text-slate-400">SECTOR: ARABIAN BASIN ALPHA</span>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-ocean-950/85 backdrop-blur border border-ocean-border p-2.5 rounded-lg text-[10px] font-mono space-y-1">
        <div className="font-bold text-slate-400 border-b border-ocean-border/60 pb-1 uppercase">Legend</div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
          <span className="text-slate-200">Ocean Spy-Buoy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          <span className="text-slate-200">Verified Vessel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
          <span className="text-slate-200">AIS Discrepancy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
          <span className="text-rose-300 font-bold">Possible Dark Vessel</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-500"></div>
          <span className="text-slate-400">Simulated AIS Broadcast</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%', background: '#050811' }}
        scrollWheelZoom={true}
      >
        {/* Dark theme tiles via CartoDB Dark Matter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Buoys with 5 km Detection Perimeter Ring */}
        {buoys.map((buoy) => (
          <React.Fragment key={buoy.id}>
            <Marker
              position={[buoy.latitude, buoy.longitude]}
              icon={createBuoyIcon(buoy.id)}
            >
              <Popup className="tactical-popup">
                <div className="font-mono text-xs p-1 text-slate-800">
                  <strong className="text-blue-600 block">{buoy.name} ({buoy.id})</strong>
                  <div>Status: <span className="font-bold text-emerald-600">{buoy.status}</span></div>
                  <div>Battery: {buoy.battery_level}%</div>
                  <div>Hydrophone Health: {buoy.hydrophone_health}</div>
                  <div>Position: {buoy.latitude.toFixed(4)}°N, {buoy.longitude.toFixed(4)}°E</div>
                  <div className="text-[10px] text-slate-500 mt-1">Coverage Radius: {buoy.detection_radius_km} km</div>
                </div>
              </Popup>
            </Marker>

            {/* Surveillance Range Ring */}
            <Circle
              center={[buoy.latitude, buoy.longitude]}
              radius={(buoy.detection_radius_km || 5.0) * 1000}
              pathOptions={{
                color: '#00F0FF',
                fillColor: '#00F0FF',
                fillOpacity: 0.05,
                weight: 1,
                dashArray: '4, 8'
              }}
            />
          </React.Fragment>
        ))}

        {/* Simulated AIS Vessel Broadcasts */}
        {aisVessels.map((vessel) => (
          <Marker
            key={`ais-${vessel.id}`}
            position={[vessel.latitude, vessel.longitude]}
            icon={createAISIcon(vessel.name, vessel.vessel_type)}
          >
            <Popup>
              <div className="font-mono text-xs p-1 text-slate-800">
                <strong className="block text-slate-900">AIS: {vessel.name}</strong>
                <div>MMSI: {vessel.mmsi}</div>
                <div>Broadcast Type: {vessel.vessel_type}</div>
                <div>Speed: {vessel.speed} kn | Heading: {vessel.heading}°</div>
                <div className="text-[10px] text-slate-500 mt-1">SIMULATED AIS FEED</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Physical Acoustic Detections */}
        {recentDetections.map((det) => {
          const isDark = det.status === 'POSSIBLE_DARK_VESSEL';
          const buoy = buoys.find((b) => b.id === det.buoy_id) || activeBuoy;

          return (
            <React.Fragment key={`det-${det.id}`}>
              {/* Bearing Line from Buoy to Estimated Vessel Location */}
              {buoy && (
                <Polyline
                  positions={[
                    [buoy.latitude, buoy.longitude],
                    [det.latitude, det.longitude],
                  ]}
                  pathOptions={{
                    color: isDark ? '#EF4444' : det.status === 'PHYSICAL_AIS_MISMATCH' ? '#F59E0B' : '#10B981',
                    weight: isDark ? 2.5 : 1.5,
                    dashArray: isDark ? '6, 6' : '3, 6',
                    opacity: 0.8
                  }}
                />
              )}

              <Marker
                position={[det.latitude, det.longitude]}
                icon={createVesselIcon(det.status, det.vessel_type)}
              >
                <Popup>
                  <div className="font-mono text-xs p-1 text-slate-800 space-y-1 max-w-xs">
                    <div className="flex items-center justify-between border-b pb-1">
                      <strong className="uppercase">{det.vessel_type}</strong>
                      <span className="font-bold text-blue-600">AI: {Math.round(det.confidence * 100)}%</span>
                    </div>
                    <div>Status: <span className="font-bold">{det.status.replace(/_/g, ' ')}</span></div>
                    <div>AIS Status: <span className="font-semibold">{det.ais_status}</span></div>
                    <div>Range: {det.distance_km} km | Bearing: {det.bearing.toFixed(0)}°</div>
                    <div>Investigation Priority: <span className="font-bold text-rose-600">{det.risk_score} / 100</span></div>
                    <div>Approx Coords: {det.latitude.toFixed(4)}°N, {det.longitude.toFixed(4)}°E</div>
                    {onSelectDetection && (
                      <button
                        onClick={() => onSelectDetection(det.id)}
                        className="w-full mt-2 py-1 px-2 rounded bg-slate-900 text-white font-bold text-[10px] hover:bg-slate-800 flex items-center justify-center gap-1"
                      >
                        <span>INVESTIGATE DETECTION</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
