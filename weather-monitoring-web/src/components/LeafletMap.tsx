import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

// ── Marker factory ────────────────────────────────────────────────────
const makeCircle = (letter: string, color: string, size: number) =>
  L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};color:#fff;display:flex;align-items:center;justify-content:center;
      font-size:${size * 0.5}px;font-weight:700;font-family:Inter,sans-serif;
      box-shadow:0 0 8px ${color}88;border:2px solid #fff3;
    ">${letter}</div>`,
    iconSize: [size, size], iconAnchor: [size / 2, size / 2],
  });

const fcIcons: Record<string, L.DivIcon> = {
  hospital:  makeCircle('H', '#f87171', 28),
  safezone:  makeCircle('S', '#4ade80', 28),
  transit:   makeCircle('T', '#38bdf8', 28),
  landmark:  makeCircle('L', '#fbbf24', 28),
  bridge:    makeCircle('B', '#a78bfa', 28),
};

const typhoonIcons = {
  past:    makeCircle('T', '#ef4444', 34),
  current: makeCircle('T', '#ef4444', 48),
  future:  makeCircle('T', '#f97316', 28),
};

const makeRiskDot = (color: string) =>
  L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #fff5;box-shadow:0 0 5px ${color}88;"></div>`,
    iconSize: [12, 12], iconAnchor: [6, 6],
  });

const riskIcons: Record<string, L.DivIcon> = {
  extreme: makeRiskDot('#ef4444'),
  high:    makeRiskDot('#f97316'),
  medium:  makeRiskDot('#f59e0b'),
  low:     makeRiskDot('#6b7280'),
};

// ── Types ─────────────────────────────────────────────────────────────
interface TyphoonPoint { lat: number; lon: number; time: string; cat: string; wind: number; pressure: number; label: string; }
interface Facility { name: string; lat: number; lon: number; addr: string; info: string; category: string; phone?: string; }
interface ImpactZone { name: string; lat: number; lon: number; type: string; risk: string; note: string; }

const FC_LABELS: Record<string, string> = {
  hospital: 'Hospital', safezone: 'Safe Zone', transit: 'Transit Hub',
  landmark: 'Landmark', bridge: 'Bridge / Tunnel',
};

// ── RainViewer ────────────────────────────────────────────────────────
const RainViewerOverlay: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const map = useMap();
  const layerRef = useRef<L.TileLayer | null>(null);
  const [frames, setFrames] = useState<{ path: string }[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let c = false;
    fetch('https://api.rainviewer.com/public/weather-maps.json')
      .then(r => r.json()).then(d => {
        if (c) return;
        setFrames([...(d.radar?.past || []), ...(d.radar?.nowcast || [])].map((p: any) => ({ path: p.path })));
      }).catch(() => {});
    return () => { c = true; };
  }, []);

  useEffect(() => {
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; }
    if (!enabled || !frames.length) return;
    layerRef.current = L.tileLayer(`https://tilecache.rainviewer.com${frames[idx].path}/256/{z}/{x}/{y}/2/1_1.png`, { opacity: 0.5, pane: 'overlayPane' }).addTo(map);
    const t = setInterval(() => setIdx(i => (i + 1) % frames.length), 600);
    return () => { clearInterval(t); if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null; } };
  }, [enabled, frames, idx, map]);

  return null;
};

// ── Inner map ─────────────────────────────────────────────────────────
interface MapInnerProps {
  center?: { lat: number; lon: number } | null;
  bbox?: { south: number; north: number; west: number; east: number } | null;
  typhoonTrack?: TyphoonPoint[];
  showTrackOnly?: boolean;
  showFacilitiesOnly?: boolean;
  facilities?: Facility[];
  impactZones?: ImpactZone[];
  onPointClick?: (p: TyphoonPoint) => void;
}

const MapInner: React.FC<MapInnerProps> = ({ center, bbox, typhoonTrack, showTrackOnly, showFacilitiesOnly, facilities, impactZones, onPointClick }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (bbox) { try { map.fitBounds([[bbox.south, bbox.west], [bbox.north, bbox.east]], { padding: [15, 15], animate: true }); } catch {} }
    else if (center) { try { map.setView([center.lat, center.lon], 10, { animate: true }); } catch {} }
  }, [center, bbox, map]);

  const trackPos: [number, number][] = (typhoonTrack || []).map(p => [p.lat, p.lon]);
  const curIdx = typhoonTrack?.findIndex(p => p.label?.includes('Current')) ?? 5;

  return (
    <>
      <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />

      {/* Typhoon track */}
      {typhoonTrack && !showFacilitiesOnly && (
        <>
          {trackPos.slice(0, curIdx + 1).length > 1 && (
            <Polyline positions={trackPos.slice(0, curIdx + 1)} pathOptions={{ color: '#ef4444', weight: 3.5, opacity: 0.9 }} />
          )}
          {trackPos.slice(curIdx).length > 1 && (
            <Polyline positions={trackPos.slice(curIdx)} pathOptions={{ color: '#f97316', weight: 2.5, dashArray: '8 8', opacity: 0.7 }} />
          )}
          {typhoonTrack.map((pt, i) => {
            if (i !== curIdx) return null;
            return (
              <React.Fragment key={`zone-${i}`}>
                <CircleMarker center={[pt.lat, pt.lon]} radius={pt.wind * 0.7} pathOptions={{ color: 'rgba(239,68,68,0.06)', fillColor: 'rgba(239,68,68,0.03)', fillOpacity: 0.3, weight: 1 }} />
                <CircleMarker center={[pt.lat, pt.lon]} radius={pt.wind * 0.35} pathOptions={{ color: 'rgba(239,68,68,0.12)', fillColor: 'rgba(239,68,68,0.05)', fillOpacity: 0.3, weight: 1 }} />
              </React.Fragment>
            );
          })}
          {typhoonTrack.map((pt, i) => {
            const isC = i === curIdx, isP = i <= curIdx;
            const ic = isC ? typhoonIcons.current : isP ? typhoonIcons.past : typhoonIcons.future;
            return (
              <Marker key={`tp-${i}`} position={[pt.lat, pt.lon]} icon={ic} eventHandlers={{ click: () => onPointClick?.(pt) }}>
                <Popup>
                  <div style={{ fontSize: 12, lineHeight: 1.7, fontFamily: 'inherit' }}>
                    <strong>{pt.time}</strong><br />
                    Category: <span style={{ color: '#f87171', fontWeight: 600 }}>{pt.cat}</span><br />
                    Wind: {pt.wind} km/h | Pressure: {pt.pressure} hPa<br />
                    {pt.label && <span style={{ color: '#fbbf24' }}>{pt.label}</span>}
                  </div>
                </Popup>
                <Tooltip direction="top" offset={[0, -18]} opacity={0.9}>
                  <span style={{ fontSize: 11 }}>{pt.time} / {pt.cat}</span>
                </Tooltip>
              </Marker>
            );
          })}
        </>
      )}

      {/* Facilities */}
      {facilities && !showTrackOnly && facilities.map((f, i) => {
        const ic = fcIcons[f.category] || fcIcons.hospital;
        const lb = FC_LABELS[f.category] || f.category;
        return (
          <Marker key={`fac-${i}`} position={[f.lat, f.lon]} icon={ic}>
            <Popup>
              <div style={{ fontSize: 12, lineHeight: 1.6, fontFamily: 'inherit', minWidth: 180 }}>
                <strong>{f.name}</strong><br />
                <span style={{ color: '#9ca3af' }}>{f.addr}</span><br />
                <span style={{ fontSize: 11 }}>{lb} / {f.info}</span><br />
                {f.phone && <span style={{ fontSize: 11 }}>Tel: {f.phone}</span>}
                <br /><a href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}`} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', fontSize: 12, fontWeight: 500 }}>Navigate (Google Maps)</a>
              </div>
            </Popup>
          </Marker>
        );
      })}

      {/* Impact zones */}
      {impactZones && !showTrackOnly && impactZones.map((z, i) => {
        const ic = riskIcons[z.risk] || riskIcons.medium;
        return (
          <Marker key={`imp-${i}`} position={[z.lat, z.lon]} icon={ic} opacity={0.8}>
            <Popup>
              <div style={{ fontSize: 12, lineHeight: 1.6, fontFamily: 'inherit', minWidth: 180 }}>
                <strong>{z.name}</strong><br />
                <span style={{ color: '#9ca3af' }}>Type: {z.type} | Risk: </span>
                <span style={{ color: z.risk === 'extreme' ? '#f87171' : z.risk === 'high' ? '#f97316' : '#fbbf24', fontWeight: 600 }}>{z.risk}</span><br />
                <span style={{ fontSize: 11 }}>{z.note}</span>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -8]} opacity={0.9}><span style={{ fontSize: 10 }}>{z.name}</span></Tooltip>
          </Marker>
        );
      })}
    </>
  );
};

// ── LeafletMap ────────────────────────────────────────────────────────
interface LeafletMapProps {
  center?: { lat: number; lon: number } | null;
  bbox?: { south: number; north: number; west: number; east: number } | null;
  typhoonTrack?: TyphoonPoint[];
  showRadar?: boolean;
  showTrackOnly?: boolean;
  showFacilitiesOnly?: boolean;
  facilities?: Facility[];
  impactZones?: ImpactZone[];
  onPointClick?: (p: TyphoonPoint) => void;
}

const LeafletMap: React.FC<LeafletMapProps> = (props) => {
  const { center } = props;
  return (
    <MapContainer center={center ? [center.lat, center.lon] : [31.23, 121.47]} zoom={10} style={{ height: '100%', width: '100%' }} zoomControl={true}>
      <MapInner {...props} />
      <RainViewerOverlay enabled={props.showRadar ?? false} />
    </MapContainer>
  );
};

export default LeafletMap;
