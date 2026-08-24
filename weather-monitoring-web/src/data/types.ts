export type FacCategory = 'hospital' | 'safezone' | 'transit' | 'landmark' | 'bridge';
export type RiskLevel = 'extreme' | 'high' | 'medium' | 'low';

export interface TyphoonPoint {
  lat: number; lon: number;
  time: string; cat: string;
  wind: number; pressure: number;
  label: string;
}

export interface Facility {
  name: string; lat: number; lon: number;
  addr: string; info: string;
  category: FacCategory; phone?: string; city: string;
}

export interface ImpactZone {
  name: string; lat: number; lon: number;
  type: string; risk: RiskLevel;
  note: string; city: string;
}

export const CAT = {
  hospital:  { label: 'Hospital',   color: '#f87171', marker: 'H' } as const,
  safezone:  { label: 'Safe Zone',  color: '#4ade80', marker: 'S' } as const,
  transit:   { label: 'Transit Hub', color: '#38bdf8', marker: 'T' } as const,
  landmark:  { label: 'Landmark',   color: '#fbbf24', marker: 'L' } as const,
  bridge:    { label: 'Bridge / Tunnel', color: '#a78bfa', marker: 'B' } as const,
};
