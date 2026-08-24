/**
 * WGS-84 to GCJ-02 (Mars Coordinates) conversion.
 * Gaode Maps uses GCJ-02, which is offset from WGS-84 by ~200-500m in China.
 * Outside China, the transform is an identity (no offset).
 */

const PI = Math.PI;
const A = 6378245.0; // semi-major axis
const EE = 0.00669342162296594323; // eccentricity squared

function transformLat(x: number, y: number): number {
  let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(y * PI) + 40.0 * Math.sin((y / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((160.0 * Math.sin((y / 12.0) * PI) + 320.0 * Math.sin((y * PI) / 30.0)) * 2.0) / 3.0;
  return ret;
}

function transformLng(x: number, y: number): number {
  let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  ret += ((20.0 * Math.sin(6.0 * x * PI) + 20.0 * Math.sin(2.0 * x * PI)) * 2.0) / 3.0;
  ret += ((20.0 * Math.sin(x * PI) + 40.0 * Math.sin((x / 3.0) * PI)) * 2.0) / 3.0;
  ret += ((150.0 * Math.sin((x / 12.0) * PI) + 300.0 * Math.sin((x / 30.0) * PI)) * 2.0) / 3.0;
  return ret;
}

export function isOutOfChina(lng: number, lat: number): boolean {
  return lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

/**
 * Convert a single WGS-84 coordinate to GCJ-02.
 * Returns [longitude, latitude] (Gaode/GCJ-02 order).
 */
export function wgs84ToGcj02(lng: number, lat: number): [number, number] {
  if (isOutOfChina(lng, lat)) return [lng, lat];

  let dLat = transformLat(lng - 105.0, lat - 35.0);
  let dLng = transformLng(lng - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * PI;
  let magic = Math.sin(radLat);
  magic = 1 - EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  dLat = (dLat * 180.0) / (((A * (1 - EE)) / (magic * sqrtMagic)) * PI);
  dLng = (dLng * 180.0) / ((A / sqrtMagic) * Math.cos(radLat) * PI);
  return [lng + dLng, lat + dLat];
}

/**
 * Convert a lat/lon object to GCJ-02 [lng, lat] pair.
 */
export function pointToGcj02(pt: { lat: number; lon: number }): [number, number] {
  return wgs84ToGcj02(pt.lon, pt.lat);
}

/**
 * Convert an array of lat/lon points to GCJ-02 [lat, lng] pairs (Leaflet order).
 */
export function trackToLeafletGcj02(points: { lat: number; lon: number }[]): [number, number][] {
  return points.map(p => {
    const [lng, lat] = wgs84ToGcj02(p.lon, p.lat);
    return [lat, lng];
  });
}
