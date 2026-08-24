import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';

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
    const L = (window as any).L;
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

const LeafletMap: React.FC<{ center?: { lat: number; lon: number } | null; bbox?: { south: number; north: number; west: number; east: number } | null }> = ({ center = null, bbox = null }) => {
  const [showRadar, setShowRadar] = useState(true);
  const mapRef = useRef<any>(null);
  // when center prop changes, pan/zoom the map
  useEffect(() => {
    if (!center || !mapRef.current) return;
    try {
      mapRef.current.setView([center.lat, center.lon], 6);
    } catch (e) {}
  }, [center]);

  // when bbox prop changes, fit bounds
  useEffect(() => {
    if (!bbox || !mapRef.current) return;
    try {
      const sw = [bbox.south, bbox.west];
      const ne = [bbox.north, bbox.east];
      mapRef.current.fitBounds([sw, ne], { padding: [20, 20] });
    } catch (e) {}
  }, [bbox]);

  return (
    <div style={{ height: 600 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <label style={{ color: '#cbd5e1' }}>
          <input type="checkbox" checked={showRadar} onChange={(e) => setShowRadar(e.target.checked)} /> Show RainViewer Radar Overlay
        </label>
      </div>
  <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} whenCreated={(m) => (mapRef.current = m)}>
        <TileLayer
          {...({ attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' } as any)}
        />
        <RainViewerOverlay enabled={showRadar} />
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
