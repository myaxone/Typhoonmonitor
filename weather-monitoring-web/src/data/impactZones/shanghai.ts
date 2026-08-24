import { ImpactZone } from '../types';

export const SHANGHAI_IMPACT_ZONES: ImpactZone[] = [
  { name: 'Lujiazui Financial District', lat: 31.236, lon: 121.502, type: 'Financial / Commercial', risk: 'extreme', note: 'High-rise cluster, glass facade debris, wind tunnel effect between towers, flooding from Huangpu', city: 'shanghai' },
  { name: 'The Bund (Waitan)', lat: 31.240, lon: 121.490, type: 'Historic / Flood Risk', risk: 'extreme', note: 'Direct Huangpu River storm surge exposure, historic masonry buildings, floodwall at 6.9m elevation', city: 'shanghai' },
  { name: 'Pudong International Airport', lat: 31.144, lon: 121.808, type: 'Aviation', risk: 'extreme', note: 'Coastal exposure, runways at 4m elevation, flight cancellations certain, storm surge 3-5m possible', city: 'shanghai' },
  { name: 'Waigaoqiao Port Area', lat: 31.350, lon: 121.590, type: 'Port / Industrial', risk: 'extreme', note: 'Container terminal, crane collapse risk, Yangtze storm surge, hazardous materials storage', city: 'shanghai' },
  { name: 'Nanjing Road Commercial Corridor', lat: 31.235, lon: 121.475, type: 'Commercial', risk: 'high', note: 'Dense pedestrian zone, signage & awning projectiles, underground flooding at metro entrances', city: 'shanghai' },
  { name: 'Hongqiao Transport Hub', lat: 31.196, lon: 121.323, type: 'Transport / Aviation', risk: 'high', note: 'Rail & air disruption nexus, low-lying approaches, drainage capacity concerns under heavy rain', city: 'shanghai' },
  { name: 'Yangpu District Riverside', lat: 31.280, lon: 121.525, type: 'Residential / Industrial', risk: 'high', note: 'Dense older housing stock, Huangpu riverfront exposure, former industrial drainage issues', city: 'shanghai' },
  { name: 'Hongkou District', lat: 31.265, lon: 121.490, type: 'Residential / Mixed', risk: 'high', note: 'Low-lying near Suzhou Creek, combined sewer overflow risk, older building stock', city: 'shanghai' },
  { name: 'Pudong New Area (Central)', lat: 31.220, lon: 121.545, type: 'Residential / Mixed', risk: 'high', note: 'High-rise residential, window & balcony projectiles, underground garage flooding', city: 'shanghai' },
  { name: 'Baoshan District', lat: 31.405, lon: 121.490, type: 'Industrial / Residential', risk: 'high', note: 'Yangtze riverfront, steel mill area, industrial zone flooding & hazmat risk', city: 'shanghai' },
  { name: 'Xuhui Riverside (West Bund)', lat: 31.168, lon: 121.459, type: 'Cultural / Mixed', risk: 'medium', note: 'New development, museums & galleries, Huangpu River West Bund floodwall, construction sites', city: 'shanghai' },
  { name: 'Jing\'an District Central', lat: 31.225, lon: 121.448, type: 'Commercial / Residential', risk: 'medium', note: 'Dense urban core, elevated roads create wind channels, basement retail flooding', city: 'shanghai' },
  { name: 'Changning District', lat: 31.220, lon: 121.415, type: 'Residential / Mixed', risk: 'medium', note: 'Relatively inland, tree-lined streets, falling branches & power lines primary risk', city: 'shanghai' },
  { name: 'Putuo District', lat: 31.255, lon: 121.395, type: 'Residential / Mixed', risk: 'medium', note: 'Inland, drainage along Suzhou Creek, older residential compounds', city: 'shanghai' },
  { name: 'Minhang District (South)', lat: 31.113, lon: 121.382, type: 'Suburban / Residential', risk: 'low', note: 'Further inland, suburban housing, tree fall & power line risks, better drainage', city: 'shanghai' },
  { name: 'Songjiang District', lat: 31.032, lon: 121.227, type: 'Suburban / University', risk: 'low', note: 'Inland, university town, new development with modern drainage, Sheshan elevation advantage', city: 'shanghai' },
  { name: 'Suzhou Creek Corridor', lat: 31.248, lon: 121.448, type: 'Waterway / Mixed', risk: 'high', note: 'Historic creek, low banks, combined sewer overflow, multiple districts affected by backflow', city: 'shanghai' },
  { name: 'Chongming Island', lat: 31.620, lon: 121.550, type: 'Island / Agricultural', risk: 'extreme', note: 'Yangtze estuary island, direct storm exposure, farmland flooding, limited bridge evacuation routes', city: 'shanghai' },
  { name: 'Dishui Lake / Lingang New City', lat: 30.900, lon: 121.930, type: 'New Development / Coastal', risk: 'extreme', note: 'Direct ocean exposure, sea wall at 200-year standard, artificial lake, limited shelter infrastructure', city: 'shanghai' },
  { name: 'Qingpu District', lat: 31.150, lon: 121.120, type: 'Residential / Water Town', risk: 'low', note: 'Westernmost district, inland water town, Dianshan Lake flooding possible, agricultural land', city: 'shanghai' },
];
