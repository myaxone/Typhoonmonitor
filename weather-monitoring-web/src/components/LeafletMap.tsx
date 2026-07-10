import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, Polyline, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Fix default marker icon issue with bundlers
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

const typhoonIcon = L.divIcon({
  className: 'typhoon-marker',
  html: '<div style="font-size:28px;filter:drop-shadow(0 0 6px red)">🌀</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const currentTyphoonIcon = L.divIcon({
  className: 'typhoon-marker-current',
  html: '<div style="font-size:40px;filter:drop-shadow(0 0 12px #ff0000);animation:pulse 1s infinite">🌀</div>',
  iconSize: [48, 48],
  iconAnchor: [24, 24],
});

const shelterIcon = L.divIcon({
  className: 'shelter-marker',
  html: '<div style="font-size:24px;filter:drop-shadow(0 0 4px #10b981)">🏥</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface TyphoonPoint {
  lat: number;
  lon: number;
  time: string;
  cat: string;
  wind: number;
  pressure: number;
  label: string;
}

interface Shelter {
  name: string;
  lat: number;
  lon: number;
  addr: string;
  capacity: string;
}

// Helper component that adds a RainViewer TileLayer and cycles frames for simple animation
const RainViewerOverlay: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  const map = useMap();
  const layerRef = useRef<any>(null);
  const [frames, setFrames] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch('https://api.rainviewer.com/public/maps.json')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const f = data.radar && data.radar.past ? data.radar.past.map((p: any) => p.time) : [];
        setFrames(f);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
      return;
    }
    if (!frames.length) return;
    const t = frames[idx];
    const url = `https://tilecache.rainviewer.com/v2/radar/${t}/256/{z}/{x}/{y}/2/1_1.png`;
    if (!L) return;
    if (layerRef.current) map.removeLayer(layerRef.current);
    layerRef.current = L.tileLayer(url, { opacity: 0.6, pane: 'overlayPane' });
    layerRef.current.addTo(map);

    const id = setInterval(() => {
      setIdx((i) => (i + 1) % frames.length);
    }, 800);
    return () => {
      clearInterval(id);
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [enabled, frames, idx, map]);

  return null;
};

// Inner map component that handles bounds
const MapInner: React.FC<{
  center?: { lat: number; lon: number } | null;
  bbox?: { south: number; north: number; west: number; east: number } | null;
  typhoonTrack?: TyphoonPoint[];
  shelters?: Shelter[];
  onPointClick?: (p: TyphoonPoint) => void;
}> = ({ center, bbox, typhoonTrack, shelters, onPointClick }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (bbox) {
      try {
        const sw: [number, number] = [bbox.south, bbox.west];
        const ne: [number, number] = [bbox.north, bbox.east];
        map.fitBounds([sw, ne], { padding: [30, 30] });
      } catch (e) {}
    } else if (center) {
      try {
        map.setView([center.lat, center.lon], 6);
      } catch (e) {}
    }
  }, [center, bbox, map]);

  const trackPositions: [number, number][] = typhoonTrack
    ? typhoonTrack.map((p) => [p.lat, p.lon] as [number, number])
    : [];

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Typhoon track line */}
      {trackPositions.length > 1 && (
        <Polyline
          positions={trackPositions}
          pathOptions={{
            color: '#ff4444',
            weight: 3,
            dashArray: '10 5',
            opacity: 0.8,
          }}
        />
      )}

      {/* Future track (dashed) */}
      {typhoonTrack && typhoonTrack.length > 5 && (
        <Polyline
          positions={typhoonTrack.slice(5).map((p) => [p.lat, p.lon] as [number, number])}
          pathOptions={{
            color: '#ffaa00',
            weight: 2,
            dashArray: '5 10',
            opacity: 0.6,
          }}
        />
      )}

      {/* Typhoon points */}
      {typhoonTrack?.map((point, i) => {
        const isCurrent = point.label.includes('当前');
        const isPast = i <= 5;
        return (
          <Marker
            key={`typhoon-${i}`}
            position={[point.lat, point.lon]}
            icon={isCurrent ? currentTyphoonIcon : typhoonIcon}
            eventHandlers={{
              click: () => onPointClick?.(point),
            }}
          >
            <Popup>
              <div style={{ fontSize: 13, lineHeight: 1.6 }}>
                <strong>{point.time}</strong><br />
                等级: <span style={{ color: '#ff4444' }}>{point.cat}</span><br />
                风速: {point.wind} km/h<br />
                气压: {point.pressure} hPa<br />
                {point.label && <span style={{ color: '#f59e0b' }}>⚠️ {point.label}</span>}
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -20]}>
              <span style={{ fontSize: 11 }}>
                {point.time} {point.cat}
              </span>
            </Tooltip>
          </Marker>
        );
      })}

      {/* Radius circles for danger zone around current position */}
      {typhoonTrack?.map((point, i) => {
        if (!point.label.includes('当前')) return null;
        return (
          <React.Fragment key={`zone-${i}`}>
            <CircleMarker
              center={[point.lat, point.lon]}
              radius={point.wind * 0.8}
              pathOptions={{
                color: 'rgba(255,0,0,0.15)',
                fillColor: 'rgba(255,0,0,0.05)',
                fillOpacity: 0.3,
                weight: 1,
              }}
            />
          </React.Fragment>
        );
      })}

      {/* Shelters */}
      {shelters?.map((s, i) => (
        <Marker
          key={`shelter-${i}`}
          position={[s.lat, s.lon]}
          icon={shelterIcon}
        >
          <Popup>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>
              <strong>🏥 {s.name}</strong><br />
              📍 {s.addr}<br />
              👥 {s.capacity}<br />
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#10b981' }}
              >
                🧭 导航到此
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

interface LeafletMapProps {
  center?: { lat: number; lon: number } | null;
  bbox?: { south: number; north: number; west: number; east: number } | null;
  typhoonTrack?: TyphoonPoint[];
  shelters?: Shelter[];
  onPointClick?: (p: TyphoonPoint) => void;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  center = null,
  bbox = null,
  typhoonTrack,
  shelters,
  onPointClick,
}) => {
  const [showRadar, setShowRadar] = useState(true);

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 1000, background: 'rgba(0,0,0,0.7)', padding: '6px 10px', borderRadius: 6 }}>
        <label style={{ color: '#cbd5e1', fontSize: 12, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showRadar}
            onChange={(e) => setShowRadar(e.target.checked)}
            style={{ marginRight: 4 }}
          />
          降雨雷达
        </label>
      </div>
      <MapContainer
        center={center ? [center.lat, center.lon] : [25, 122]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <MapInner
          center={center}
          bbox={bbox}
          typhoonTrack={typhoonTrack}
          shelters={shelters}
          onPointClick={onPointClick}
        />
        <RainViewerOverlay enabled={showRadar} />
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
