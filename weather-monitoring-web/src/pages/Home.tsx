import React, { useState, useEffect, Suspense } from 'react';

const LeafletMap = React.lazy(() => import('../components/LeafletMap'));

// ═══════════════════════════════════════════════════════════════════
// TYPHOON BAVI TRACK
// ═══════════════════════════════════════════════════════════════════
const BAVI_TRACK = [
  { lat: 13.5, lon: 131.2, time: '7/8 06:00', cat: 'Tropical Depression', wind: 55, pressure: 1002, label: 'Formation' },
  { lat: 15.8, lon: 129.5, time: '7/8 18:00', cat: 'Tropical Storm', wind: 75, pressure: 995, label: 'Intensifying' },
  { lat: 18.2, lon: 127.8, time: '7/9 06:00', cat: 'Severe Tropical Storm', wind: 95, pressure: 985, label: '' },
  { lat: 20.5, lon: 126.0, time: '7/9 18:00', cat: 'Typhoon', wind: 130, pressure: 965, label: 'Typhoon Category' },
  { lat: 22.8, lon: 124.2, time: '7/10 06:00', cat: 'Severe Typhoon', wind: 155, pressure: 945, label: 'Entering East China Sea' },
  { lat: 25.0, lon: 122.5, time: '7/10 18:00', cat: 'Severe Typhoon', wind: 165, pressure: 935, label: 'Current Position' },
  { lat: 27.2, lon: 120.8, time: '7/11 06:00', cat: 'Typhoon', wind: 140, pressure: 955, label: 'Projected Zhejiang Landfall' },
  { lat: 29.5, lon: 119.0, time: '7/11 18:00', cat: 'Severe Tropical Storm', wind: 100, pressure: 975, label: 'Weakening Inland' },
  { lat: 31.8, lon: 117.2, time: '7/12 06:00', cat: 'Tropical Storm', wind: 70, pressure: 990, label: 'Continuing to Weaken' },
  { lat: 34.0, lon: 115.5, time: '7/12 18:00', cat: 'Tropical Depression', wind: 50, pressure: 998, label: 'Dissipating' },
];

// ═══════════════════════════════════════════════════════════════════
// FACILITY TYPE DEFINITIONS
// ═══════════════════════════════════════════════════════════════════
type FacCategory = 'hospital' | 'safezone' | 'transit' | 'landmark' | 'bridge';

interface Facility {
  name: string; lat: number; lon: number; addr: string;
  info: string; category: FacCategory; phone?: string;
}

interface ImpactZone {
  name: string; lat: number; lon: number;
  type: string; risk: 'extreme' | 'high' | 'medium' | 'low';
  note: string;
}

const CAT = {
  hospital:  { label: 'Hospital',   color: '#f87171', marker: 'H' } as const,
  safezone:  { label: 'Safe Zone',  color: '#4ade80', marker: 'S' } as const,
  transit:   { label: 'Transit Hub', color: '#38bdf8', marker: 'T' } as const,
  landmark:  { label: 'Landmark',   color: '#fbbf24', marker: 'L' } as const,
  bridge:    { label: 'Bridge / Tunnel', color: '#a78bfa', marker: 'B' } as const,
};

// ═══════════════════════════════════════════════════════════════════
// ALL SHANGHAI FACILITIES (60+)
// ═══════════════════════════════════════════════════════════════════
const SHANGHAI_FACILITIES: Facility[] = [
  // ── Hospitals (14) ─────────────────────────────────────────────
  { name: 'Ruijin Hospital (Jiao Tong Univ. Affiliated)', lat: 31.215, lon: 121.463, addr: '197 Ruijin Er Road, Huangpu', info: 'Level A Tertiary, 2,000+ beds, trauma & emergency center', category: 'hospital', phone: '021-64370045' },
  { name: 'Huashan Hospital (Fudan Univ. Affiliated)', lat: 31.218, lon: 121.447, addr: '12 Wulumuqi Zhong Road, Jing\'an', info: 'Level A Tertiary, 1,800+ beds, neurosurgery & infectious disease', category: 'hospital', phone: '021-52889999' },
  { name: 'Zhongshan Hospital (Fudan Univ. Affiliated)', lat: 31.197, lon: 121.457, addr: '180 Fenglin Road, Xuhui', info: 'Level A Tertiary, 2,000+ beds, national cardiology center', category: 'hospital', phone: '021-64041990' },
  { name: 'Renji Hospital (Jiao Tong Univ. Affiliated)', lat: 31.240, lon: 121.488, addr: '1630 Dongfang Road, Pudong', info: 'Level A Tertiary, 1,600+ beds, Pudong emergency hub', category: 'hospital', phone: '021-68383115' },
  { name: 'Shanghai First People\'s Hospital', lat: 31.235, lon: 121.488, addr: '100 Haining Road, Hongkou', info: 'Level A Tertiary, 1,500+ beds, general emergency & ophthalmology', category: 'hospital', phone: '021-63240090' },
  { name: 'Changhai Hospital (Naval Medical Univ.)', lat: 31.275, lon: 121.528, addr: '168 Changhai Road, Yangpu', info: 'Level A Tertiary, 2,200+ beds, burns & trauma specialty', category: 'hospital', phone: '021-31166666' },
  { name: 'Shanghai East Hospital (Tongji Univ. Affiliated)', lat: 31.240, lon: 121.518, addr: '150 Jimo Road, Pudong', info: 'Level A Tertiary, 1,200+ beds, disaster medicine center', category: 'hospital', phone: '021-38804518' },
  { name: 'Xinhua Hospital (Jiao Tong Univ. Affiliated)', lat: 31.272, lon: 121.520, addr: '1665 Kongjiang Road, Yangpu', info: 'Level A Tertiary, 2,000+ beds, pediatric emergency', category: 'hospital', phone: '021-25078999' },
  { name: 'Shanghai Ninth People\'s Hospital', lat: 31.215, lon: 121.490, addr: '639 Zhizaoju Road, Huangpu', info: 'Level A Tertiary, 1,800+ beds, maxillofacial & plastic surgery', category: 'hospital', phone: '021-23271699' },
  { name: 'Longhua Hospital (Univ. of TCM)', lat: 31.203, lon: 121.451, addr: '725 Wanping Road South, Xuhui', info: 'Level A Tertiary, 1,200+ beds, integrated Chinese-Western medicine', category: 'hospital', phone: '021-64385700' },
  { name: 'Shanghai Sixth People\'s Hospital', lat: 31.177, lon: 121.424, addr: '600 Yishan Road, Xuhui', info: 'Level A Tertiary, 1,800+ beds, orthopedics & microsurgery', category: 'hospital', phone: '021-64369181' },
  { name: 'Huadong Hospital (Fudan Univ. Affiliated)', lat: 31.223, lon: 121.440, addr: '221 Yan\'an West Road, Jing\'an', info: 'Level A Tertiary, 800+ beds, geriatric & senior care', category: 'hospital', phone: '021-62483180' },
  { name: 'Shanghai Children\'s Medical Center', lat: 31.206, lon: 121.523, addr: '1678 Dongfang Road, Pudong', info: 'Level A Tertiary, 600+ beds, pediatric emergency & surgery', category: 'hospital', phone: '021-38626161' },
  { name: 'Shanghai Pulmonary Hospital (Tongji Univ.)', lat: 31.295, lon: 121.498, addr: '507 Zhengmin Road, Yangpu', info: 'Level A Tertiary, 800+ beds, respiratory & thoracic', category: 'hospital', phone: '021-65115006' },

  // ── Safe Zones / Shelters (16) ──────────────────────────────────
  { name: 'Sheshan National Forest Park', lat: 31.096, lon: 121.188, addr: 'Songjiang District', info: 'Elevation 100m, highest natural point in Shanghai, mass evacuation capacity', category: 'safezone' },
  { name: 'Shanghai Stadium Emergency Shelter', lat: 31.183, lon: 121.438, addr: '1111 Caoxi Bei Road, Xuhui', info: 'Capacity 5,000, reinforced concrete, medical station, supplies depot', category: 'safezone', phone: '021-64385200' },
  { name: 'Shanghai Oriental Sports Center', lat: 31.158, lon: 121.486, addr: '701 Yaohua Road, Pudong', info: 'Capacity 8,000, inland location, emergency supplies warehouse', category: 'safezone', phone: '021-20238008' },
  { name: 'Shanghai World Expo Pavilion', lat: 31.190, lon: 121.480, addr: 'Expo Avenue, Pudong', info: 'Capacity 10,000+, reinforced exhibition halls, medical post', category: 'safezone' },
  { name: 'Shanghai International Gymnastics Center', lat: 31.232, lon: 121.410, addr: '777 Wuyi Road, Changning', info: 'Capacity 3,000, inland elevated, Changning district shelter', category: 'safezone', phone: '021-62752623' },
  { name: 'Hongkou Football Stadium Shelter', lat: 31.273, lon: 121.477, addr: '444 Dongjiangwan Road, Hongkou', info: 'Capacity 5,000, Hongkou district primary shelter', category: 'safezone' },
  { name: 'Yuanshen Sports Centre Shelter', lat: 31.235, lon: 121.530, addr: '333 Yuanshen Road, Pudong', info: 'Capacity 3,500, Pudong community shelter, supplies available', category: 'safezone' },
  { name: 'Jing\'an Sports Centre Shelter', lat: 31.232, lon: 121.447, addr: '123 Kangding Road, Jing\'an', info: 'Capacity 2,500, Jing\'an district central shelter', category: 'safezone' },
  { name: 'Putuo Sports Centre Shelter', lat: 31.252, lon: 121.410, addr: '400 Daduhe Road, Putuo', info: 'Capacity 3,000, Putuo district primary shelter', category: 'safezone' },
  { name: 'Yangpu Sports Centre Shelter', lat: 31.283, lon: 121.533, addr: '640 Longchang Road, Yangpu', info: 'Capacity 3,500, Yangpu district inland shelter', category: 'safezone' },
  { name: 'Minhang Sports Park Shelter', lat: 31.112, lon: 121.375, addr: '500 Xinzhen Road, Minhang', info: 'Capacity 4,000, Minhang district elevated shelter', category: 'safezone' },
  { name: 'Baoshan Sports Centre Shelter', lat: 31.405, lon: 121.485, addr: '700 Yongqing Road, Baoshan', info: 'Capacity 3,000, Baoshan district shelter, Yangtze-adjacent', category: 'safezone' },
  { name: 'Jiading Sports Centre Shelter', lat: 31.375, lon: 121.255, addr: '118 Xincheng Road, Jiading', info: 'Capacity 2,500, Jiading inland shelter', category: 'safezone' },
  { name: 'Qingpu Sports Centre Shelter', lat: 31.152, lon: 121.120, addr: '1000 Yinggang East Road, Qingpu', info: 'Capacity 3,000, western Shanghai inland shelter', category: 'safezone' },
  { name: 'Songjiang University Town Shelter', lat: 31.045, lon: 121.210, addr: 'Songjiang University Town', info: 'Capacity 6,000+, multiple gymnasiums, inland elevated', category: 'safezone' },
  { name: 'Fengxian Bay Resort Shelter', lat: 30.820, lon: 121.520, addr: '999 Haijian Road, Fengxian', info: 'Capacity 2,000, southern coastal backup shelter', category: 'safezone' },

  // ── Transit Hubs (12) ───────────────────────────────────────────
  { name: 'Shanghai Hongqiao Railway Station', lat: 31.196, lon: 121.318, addr: '1500 Mingui Road, Minhang', info: 'Largest railway station in Asia, 110M+ annual passengers, Lines 2/10/17, high-speed rail hub', category: 'transit' },
  { name: 'Shanghai Railway Station', lat: 31.252, lon: 121.455, addr: '303 Moling Road, Jing\'an', info: 'Central station, Lines 1/3/4, 50M+ annual passengers, historic main terminal', category: 'transit' },
  { name: 'Shanghai South Railway Station', lat: 31.155, lon: 121.430, addr: '289 Laohumin Road, Xuhui', info: 'Southern hub, Lines 1/3, medium-long distance trains', category: 'transit' },
  { name: 'Shanghai West Railway Station', lat: 31.265, lon: 121.395, addr: '100 Taopu Road, Putuo', info: 'Western station, Line 11, regional & freight', category: 'transit' },
  { name: 'Pudong International Airport', lat: 31.144, lon: 121.808, addr: 'Pudong New Area', info: 'International gateway, 74M+ passengers, Maglev & Line 2, extreme coastal exposure', category: 'transit' },
  { name: 'Hongqiao International Airport (SHA)', lat: 31.198, lon: 121.337, addr: '2550 Hongqiao Road, Changning', info: 'Domestic hub, 45M+ passengers, Terminal 1 & 2, connected to railway station', category: 'transit' },
  { name: 'People\'s Square Metro Interchange', lat: 31.230, lon: 121.474, addr: 'People\'s Avenue, Huangpu', info: 'Lines 1/2/8, busiest metro station, 600K+ daily passengers, underground flooding risk', category: 'transit' },
  { name: 'Century Avenue Metro Interchange', lat: 31.235, lon: 121.515, addr: 'Century Avenue, Pudong', info: 'Lines 2/4/6/9, 4-line interchange, Pudong transit core', category: 'transit' },
  { name: 'Xujiahui Metro Interchange', lat: 31.195, lon: 121.437, addr: 'Xujiahui, Xuhui', info: 'Lines 1/9/11, major commercial district, underground complex', category: 'transit' },
  { name: 'Nanjing East Road Metro Station', lat: 31.238, lon: 121.486, addr: 'Nanjing East Road, Huangpu', info: 'Lines 2/10, serves pedestrian mall, dense surface area, signage & debris hazard', category: 'transit' },
  { name: 'Shanghai Long-Distance Bus Terminal', lat: 31.253, lon: 121.452, addr: '1662 Zhongxing Road, Jing\'an', info: 'Intercity bus hub, evacuation transport staging point', category: 'transit' },
  { name: 'Shanghai South Long-Distance Bus Station', lat: 31.157, lon: 121.427, addr: 'Shilong Road, Xuhui', info: 'Southern intercity bus terminal, evacuation transport hub', category: 'transit' },

  // ── Landmarks / Major Buildings (16) ────────────────────────────
  { name: 'Shanghai Tower', lat: 31.236, lon: 121.504, addr: '501 Yincheng Middle Road, Pudong', info: '632m, 128 floors, tallest building in China, glass curtain wall wind hazard, elevator shutdown above Force 8', category: 'landmark' },
  { name: 'Shanghai World Financial Center (SWFC)', lat: 31.237, lon: 121.503, addr: '100 Century Avenue, Pudong', info: '492m, 101 floors, trapezoid aperture wind load, neighboring Shanghai Tower', category: 'landmark' },
  { name: 'Jin Mao Tower', lat: 31.237, lon: 121.501, addr: '88 Century Avenue, Pudong', info: '421m, 88 floors, Grand Hyatt hotel, concrete core structure, window debris risk', category: 'landmark' },
  { name: 'Oriental Pearl Tower', lat: 31.240, lon: 121.500, addr: '1 Century Avenue, Pudong', info: '468m, broadcast tower, spherical structure high wind resistance but antenna hazard', category: 'landmark' },
  { name: 'Shanghai Museum (People\'s Square)', lat: 31.230, lon: 121.471, addr: '201 Renmin Avenue, Huangpu', info: 'Low-rise, underground galleries, basement flooding risk', category: 'landmark' },
  { name: 'Shanghai Grand Theatre', lat: 31.232, lon: 121.472, addr: '300 Renmin Avenue, Huangpu', info: 'Curved glass roof, debris hazard, adjacent to People\'s Square', category: 'landmark' },
  { name: 'Shanghai Exhibition Centre', lat: 31.226, lon: 121.448, addr: '1000 Yan\'an Middle Road, Jing\'an', info: 'Soviet-era structure, large open plaza, temporary shelter potential', category: 'landmark' },
  { name: 'Shanghai International Finance Centre (IFC)', lat: 31.236, lon: 121.502, addr: '8 Century Avenue, Pudong', info: 'Twin towers 260m/250m, luxury mall below, Lujiazui wind tunnel area', category: 'landmark' },
  { name: 'Plaza 66 (Henglong Plaza)', lat: 31.228, lon: 121.452, addr: '1266 Nanjing West Road, Jing\'an', info: '288m office tower, luxury retail, glass and steel structure', category: 'landmark' },
  { name: 'Shanghai World Financial Center (SWFC)', lat: 31.237, lon: 121.503, addr: '100 Century Avenue, Pudong', info: '492m, 101 floors, trapezoid aperture wind load, neighboring Shanghai Tower', category: 'landmark' },
  { name: 'K11 Art Mall', lat: 31.224, lon: 121.472, addr: '300 Huaihai Middle Road, Huangpu', info: 'Underground art gallery & retail, basement water ingress risk', category: 'landmark' },
  { name: 'Global Harbor (Huanqiu Gang)', lat: 31.232, lon: 121.413, addr: '3300 Zhongshan North Road, Putuo', info: 'Massive mall, 480K sqm, glass atrium, large-span roof wind load', category: 'landmark' },
  { name: 'Shanghai Library', lat: 31.209, lon: 121.445, addr: '1555 Huaihai Middle Road, Xuhui', info: 'Major repository, below-grade archives, water damage risk', category: 'landmark' },
  { name: 'Longhua Temple', lat: 31.177, lon: 121.452, addr: '2853 Longhua Road, Xuhui', info: 'Historic pagoda (40m), oldest temple in Shanghai, ancient brick structure', category: 'landmark' },
  { name: 'Jing\'an Temple', lat: 31.224, lon: 121.448, addr: '1686 Nanjing West Road, Jing\'an', info: 'Historic temple, golden pagoda, dense surrounding commercial area', category: 'landmark' },
  { name: 'Shanghai Customs House (The Bund)', lat: 31.240, lon: 121.486, addr: '13 The Bund, Huangpu', info: '1927 clock tower, riverfront, storm surge direct exposure, historic masonry', category: 'landmark' },

  // ── Bridges & Tunnels (10) ──────────────────────────────────────
  { name: 'Yangpu Bridge', lat: 31.257, lon: 121.543, addr: 'Yangpu to Pudong', info: '8,354m total length, cable-stayed, main span 602m, wind speed limit 25m/s for closure', category: 'bridge' },
  { name: 'Nanpu Bridge', lat: 31.208, lon: 121.504, addr: 'Huangpu to Pudong', info: '8,346m total length, cable-stayed, main span 423m, spiral approach ramps, closure above Force 8', category: 'bridge' },
  { name: 'Lupu Bridge', lat: 31.191, lon: 121.477, addr: 'Luwan to Pudong', info: '3,900m length, steel arch, world\'s longest arch span (550m), wind-sensitive structure', category: 'bridge' },
  { name: 'Xupu Bridge', lat: 31.133, lon: 121.465, addr: 'Xuhui to Pudong', info: '6,017m length, cable-stayed, S20 outer ring expressway crossing', category: 'bridge' },
  { name: 'Minpu Bridge', lat: 31.053, lon: 121.478, addr: 'Minhang to Pudong', info: '3,982m length, double-deck cable-stayed, S32 expressway, upper/lower deck wind differential', category: 'bridge' },
  { name: 'Fuxing East Road Tunnel', lat: 31.218, lon: 121.498, addr: 'Fuxing East Road, Huangpu to Pudong', info: '2,780m, dual-bore, 2 lanes each, drainage pumps critical during typhoon', category: 'bridge' },
  { name: 'Yan\'an East Road Tunnel', lat: 31.235, lon: 121.494, addr: 'Yan\'an East Road, Huangpu to Pudong', info: '2,261m, dual-bore, 2 lanes, oldest Huangpu River tunnel, flood gate present', category: 'bridge' },
  { name: 'Dalian Road Tunnel', lat: 31.258, lon: 121.523, addr: 'Dalian Road, Yangpu to Pudong', info: '2,526m, dual-bore, Line 4 metro shares tunnel corridor', category: 'bridge' },
  { name: 'Xinjian Road Tunnel', lat: 31.228, lon: 121.510, addr: 'Xinjian Road, Huangpu to Pudong', info: '2,350m, dual-bore, 2 lanes, newer crossing, advanced pumping', category: 'bridge' },
  { name: 'Shanghai Yangtze River Tunnel-Bridge', lat: 31.435, lon: 121.745, addr: 'Baoshan to Changxing Island', info: '25.5km total, tunnel+bridge combination, key evacuation route if Yangtze floods', category: 'bridge' },
];

// ═══════════════════════════════════════════════════════════════════
// SHANGHAI IMPACT ZONES (20)
// ═══════════════════════════════════════════════════════════════════
const SHANGHAI_IMPACT_ZONES: ImpactZone[] = [
  { name: 'Lujiazui Financial District', lat: 31.236, lon: 121.502, type: 'Financial / Commercial', risk: 'extreme', note: 'High-rise cluster, glass facade debris, wind tunnel effect between towers, flooding from Huangpu' },
  { name: 'The Bund (Waitan)', lat: 31.240, lon: 121.490, type: 'Historic / Flood Risk', risk: 'extreme', note: 'Direct Huangpu River storm surge exposure, historic masonry buildings, floodwall at 6.9m elevation' },
  { name: 'Pudong International Airport', lat: 31.144, lon: 121.808, type: 'Aviation', risk: 'extreme', note: 'Coastal exposure, runways at 4m elevation, flight cancellations certain, storm surge 3--5m possible' },
  { name: 'Waigaoqiao Port Area', lat: 31.350, lon: 121.590, type: 'Port / Industrial', risk: 'extreme', note: 'Container terminal, crane collapse risk, Yangtze storm surge, hazardous materials storage' },
  { name: 'Nanjing Road Commercial Corridor', lat: 31.235, lon: 121.475, type: 'Commercial', risk: 'high', note: 'Dense pedestrian zone, signage & awning projectiles, underground flooding at metro entrances' },
  { name: 'Hongqiao Transport Hub', lat: 31.196, lon: 121.323, type: 'Transport / Aviation', risk: 'high', note: 'Rail & air disruption nexus, low-lying approaches, drainage capacity concerns under heavy rain' },
  { name: 'Yangpu District Riverside', lat: 31.280, lon: 121.525, type: 'Residential / Industrial', risk: 'high', note: 'Dense older housing stock, Huangpu riverfront exposure, former industrial drainage issues' },
  { name: 'Hongkou District', lat: 31.265, lon: 121.490, type: 'Residential / Mixed', risk: 'high', note: 'Low-lying near Suzhou Creek, combined sewer overflow risk, older building stock' },
  { name: 'Pudong New Area (Central)', lat: 31.220, lon: 121.545, type: 'Residential / Mixed', risk: 'high', note: 'High-rise residential, window & balcony projectiles, underground garage flooding' },
  { name: 'Baoshan District', lat: 31.405, lon: 121.490, type: 'Industrial / Residential', risk: 'high', note: 'Yangtze riverfront, steel mill area, industrial zone flooding & hazmat risk' },
  { name: 'Xuhui Riverside (West Bund)', lat: 31.168, lon: 121.459, type: 'Cultural / Mixed', risk: 'medium', note: 'New development, museums & galleries, Huangpu River West Bund floodwall, construction sites' },
  { name: 'Jing\'an District Central', lat: 31.225, lon: 121.448, type: 'Commercial / Residential', risk: 'medium', note: 'Dense urban core, elevated roads create wind channels, basement retail flooding' },
  { name: 'Changning District', lat: 31.220, lon: 121.415, type: 'Residential / Mixed', risk: 'medium', note: 'Relatively inland, tree-lined streets, falling branches & power lines primary risk' },
  { name: 'Putuo District', lat: 31.255, lon: 121.395, type: 'Residential / Mixed', risk: 'medium', note: 'Inland, drainage along Suzhou Creek, older residential compounds' },
  { name: 'Minhang District (South)', lat: 31.113, lon: 121.382, type: 'Suburban / Residential', risk: 'low', note: 'Further inland, suburban housing, tree fall & power line risks, better drainage' },
  { name: 'Songjiang District', lat: 31.032, lon: 121.227, type: 'Suburban / University', risk: 'low', note: 'Inland, university town, new development with modern drainage, Sheshan elevation advantage' },
  { name: 'Suzhou Creek Corridor', lat: 31.248, lon: 121.448, type: 'Waterway / Mixed', risk: 'high', note: 'Historic creek, low banks, combined sewer overflow, multiple districts affected by backflow' },
  { name: 'Chongming Island', lat: 31.620, lon: 121.550, type: 'Island / Agricultural', risk: 'extreme', note: 'Yangtze estuary island, direct storm exposure, farmland flooding, limited bridge evacuation routes' },
  { name: 'Dishui Lake / Lingang New City', lat: 30.900, lon: 121.930, type: 'New Development / Coastal', risk: 'extreme', note: 'Direct ocean exposure, sea wall at 200-year standard, artificial lake, limited shelter infrastructure' },
  { name: 'Qingpu District', lat: 31.150, lon: 121.120, type: 'Residential / Water Town', risk: 'low', note: 'Westernmost district, inland water town, Dianshan Lake flooding possible, agricultural land' },
];

// ═══════════════════════════════════════════════════════════════════
// SHARED UTILITIES
// ═══════════════════════════════════════════════════════════════════

const LiveClock: React.FC = () => {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return <span style={{ fontVariantNumeric: 'tabular-nums' }}>{t.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>;
};

const WindSvg = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }}>
    <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"/>
  </svg>
);

const RiskBadge: React.FC<{ risk: string }> = ({ risk }) => (
  <span className={`risk-badge risk-badge-${risk}`}>{risk}</span>
);

const MarkerIcon: React.FC<{ color: string; children: string }> = ({ color, children }) => (
  <span className="facility-marker-icon" style={{ background: color }}>{children}</span>
);

// ═══════════════════════════════════════════════════════════════════
// TAB 1: LIVE MONITOR
// ═══════════════════════════════════════════════════════════════════
const TyphoonLive: React.FC = () => {
  const [view, setView] = useState<'radar' | 'track'>('radar');
  const [selected, setSelected] = useState<(typeof BAVI_TRACK)[0] | null>(null);
  const [facFilter, setFacFilter] = useState<string>('all');

  const filteredFacs = facFilter === 'all' ? SHANGHAI_FACILITIES : SHANGHAI_FACILITIES.filter(f => f.category === facFilter);

  return (
    <div>
      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item"><span className="stat-label">Central Pressure</span><span className="stat-value">935 <small>hPa</small></span></div>
        <div className="stat-item"><span className="stat-label">Max Wind Speed</span><span className="stat-value" style={{ color: '#f87171' }}>165 <small>km/h</small></span></div>
        <div className="stat-item"><span className="stat-label">Direction</span><span className="stat-value">NW <small>Northwest</small></span></div>
        <div className="stat-item"><span className="stat-label">Movement Speed</span><span className="stat-value">18 <small>km/h</small></span></div>
        <div className="stat-item"><span className="stat-label">Gale Radius F7</span><span className="stat-value">380 <small>km</small></span></div>
        <div className="stat-item"><span className="stat-label">Storm Radius F10</span><span className="stat-value" style={{ color: '#fb923c' }}>120 <small>km</small></span></div>
      </div>

      {/* Shanghai Impact Summary */}
      <div className="impact-summary">
        <div className="impact-item danger"><span className="impact-label">Shanghai Impact Status</span><span className="impact-value">Severe Threat &mdash; Landfall Proximity</span></div>
        <div className="impact-item warn"><span className="impact-label">Estimated Arrival (Shanghai)</span><span className="impact-value">July 11, ~12:00--18:00 CST</span></div>
        <div className="impact-item warn"><span className="impact-label">Expected Wind (Shanghai)</span><span className="impact-value">80--120 km/h, Gusts to 150 km/h</span></div>
        <div className="impact-item danger"><span className="impact-label">Storm Surge Risk (Huangpu)</span><span className="impact-value">River 2--4m above normal, Bund floodwall near capacity</span></div>
      </div>

      {/* Map */}
      <div className="map-shell">
        <div className="map-toolbar">
          <div className="map-toolbar-left">
            <span style={{ fontWeight: 600, fontSize: 14 }}>Typhoon BAVI</span>
            <span className="badge badge-danger" style={{ marginLeft: 10 }}>Severe Typhoon</span>
            <span style={{ marginLeft: 12, color: '#6b7280', fontSize: 12 }}>Live <LiveClock /> CST</span>
          </div>
          <div className="map-toolbar-right">
            <button className={`seg-btn ${view === 'radar' ? 'seg-active' : ''}`} onClick={() => setView('radar')}>Radar</button>
            <button className={`seg-btn ${view === 'track' ? 'seg-active' : ''}`} onClick={() => setView('track')}>Track</button>
            <a href="https://www.windy.com/?31.230,121.470,9" target="_blank" rel="noopener noreferrer" className="seg-btn" style={{ textDecoration: 'none' }}>Windy Full Map</a>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 0, height: 560 }}>
          <div style={{ position: 'relative' }}>
            <Suspense fallback={<div className="map-placeholder"><div className="loading-spinner" /></div>}>
              <LeafletMap
                center={{ lat: 31.23, lon: 121.47 }}
                bbox={{ south: 30.70, north: 31.70, west: 120.85, east: 122.00 }}
                typhoonTrack={BAVI_TRACK}
                showRadar={view === 'radar'}
                facilities={filteredFacs}
                impactZones={SHANGHAI_IMPACT_ZONES}
                onPointClick={setSelected}
              />
            </Suspense>
            <div className="radar-legend">
              <div className="radar-legend-title">Rainfall mm/h</div>
              <div className="radar-legend-gradient" />
              <div className="radar-legend-labels"><span>0.1</span><span>0.5</span><span>2</span><span>5</span><span>10</span><span>25</span><span>50+</span></div>
            </div>
            <div className="facility-legend">
              <div className="facility-legend-title">Map Legend</div>
              {Object.entries(CAT).map(([k, v]) => (
                <div key={k} className="facility-legend-row">
                  <span className="facility-dot" style={{ background: v.color }} />
                  <span>{v.label} ({v.marker})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Side panel */}
          <div className="map-side-panel">
            <div style={{ padding: '0 16px 10px' }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 10px' }}>
                Shanghai Facilities ({SHANGHAI_FACILITIES.length})
              </h3>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                <button className={`filter-chip ${facFilter === 'all' ? 'active' : ''}`} onClick={() => setFacFilter('all')}>All</button>
                {Object.entries(CAT).map(([k, v]) => (
                  <button key={k} className={`filter-chip ${facFilter === k ? 'active' : ''}`} onClick={() => setFacFilter(k)} style={{ borderColor: facFilter === k ? v.color : undefined }}>
                    <span className="facility-dot" style={{ background: v.color, display: 'inline-block', width: 7, height: 7, borderRadius: '50%', marginRight: 3 }} />
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="shelter-mini-list">
              {SHANGHAI_FACILITIES.filter(f => facFilter === 'all' || f.category === facFilter).map((f, i) => {
                const cat = CAT[f.category];
                return (
                  <div key={i} className="shelter-mini-item">
                    <MarkerIcon color={cat.color}>{cat.marker}</MarkerIcon>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                      <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.info}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Shanghai Impact Zones Grid */}
      <section style={{ marginTop: 24 }}>
        <div className="section-header"><h3 className="section-title">Shanghai District Impact Assessment</h3><span style={{ fontSize: 11, color: '#6b7280' }}>{SHANGHAI_IMPACT_ZONES.length} zones mapped</span></div>
        <div className="impact-zones-grid">
          {SHANGHAI_IMPACT_ZONES.map((z, i) => (
            <div key={i} className={`district-card risk-${z.risk}`}>
              <div className="district-card-header">
                <span className="district-name">{z.name}</span>
                <RiskBadge risk={z.risk} />
              </div>
              <div className="district-type">{z.type}</div>
              <div className="district-note">{z.note}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// TAB 2: HOME PREPAREDNESS GUIDE (EXPANDED)
// ═══════════════════════════════════════════════════════════════════
const PreparednessGuide: React.FC = () => {
  const phases = [
    {
      title: 'Before Landfall -- Preparation', color: '#38bdf8',
      items: [
        'Monitor official typhoon warnings continuously. Track CMA, JMA, and Joint Typhoon Warning Center updates every 3 hours. Know the difference between Blue (IV), Yellow (III), Orange (II), and Red (I) warning levels.',
        'Inspect every window and door. Apply masking tape in a cross-hatch pattern on glass to reduce shatter spray. Install storm shutters or nail plywood over windows if in a high-rise or coastal exposure zone.',
        'Clear all balconies, windowsills, rooftops, air conditioner units, and exterior ledges. Anything not bolted down becomes a projectile at 120+ km/h winds. This includes flower pots, drying racks, satellite dishes, and decorative items.',
        'Trim tree branches near windows and power lines. Weak or dead branches will snap and cause damage. Contact property management or 12345 for public trees.',
        'Stock a minimum 3-day supply: drinking water (4L per person per day), non-perishable food (canned goods, energy bars, instant noodles), manual can opener, portable stove with fuel canisters. Assume electricity and gas will be cut.',
        'Prepare a waterproof emergency kit: flashlights (2 minimum), spare batteries, hand-crank radio, power banks (fully charged), first aid kit with prescription medications, copies of ID/passport/insurance in sealed plastic bags, cash (ATMs offline).',
        'Fill vehicle fuel tanks and charge EVs to 100%. Park in covered garages or on high ground away from trees, signs, and construction scaffolding. Never park in underground garages in flood-prone areas.',
        'Know your evacuation route. Locate the nearest shelter on the map in this app. Plan two routes. If you live in Bund or Pudong riverside below 5m elevation, pre-evacuate before the order comes.',
        'Secure large furniture. Move beds away from windows. Close all interior doors to compartmentalize wind pressure. Close and latch exterior shutters and gates.',
        'Charge all devices: phones, tablets, laptops, power tools, rechargeable fans. Download offline maps of Shanghai. Save emergency numbers to speed dial.',
        'Fill bathtubs, washing machines, and clean containers with water for sanitation (flushing toilets, washing). Do NOT use this water for drinking unless purified.',
        'Move valuables, documents, and electronics to upper floors. Unplug all non-essential appliances. Photograph each room for insurance documentation.',
        'Communicate your plan to family members. Establish a check-in schedule. Share your evacuation route and shelter destination.',
      ],
    },
    {
      title: 'During Landfall -- Shelter in Place', color: '#ef4444',
      items: [
        'Stay indoors. Away from all windows, skylights, and exterior doors. The safest location is an interior room on the lowest floor (bathroom, closet, hallway) -- never the attic. Put as many walls between you and the outside as possible.',
        'If you hear the wind suddenly stop, you may be in the eye. Do NOT go outside. The back wall of the eye will hit within minutes, often stronger than the front. Wait for official all-clear.',
        'Close all interior doors. This compartmentalizes wind pressure -- if one window breaks, the entire apartment does not pressurize and blow out the roof. Keep a doorstop or heavy object against the door of the room you are sheltering in.',
        'If windows break, stay low below the window line. Use a mattress, heavy blanket, or table as a shield. Do not try to board up a broken window during the storm -- shards become missiles.',
        'Monitor alerts via battery-powered radio (AM/FM) or phone. Shanghai Emergency Broadcasting on FM 93.4 / AM 990. WeChat official accounts: Shanghai Fabu, Shanghai Emergency Management.',
        'If water enters, move to higher floors immediately. Do not wade through floodwater -- it may be electrically charged from downed lines or contaminated with sewage. If rising water traps you on an upper floor, signal from windows with a flashlight or bright cloth.',
        'Turn off gas at the main valve if you smell gas or hear a hissing sound. Do not use matches, lighters, or any open flame. If the electrical panel is in a dry location, switch off the main breaker if water approaches outlets.',
        'If you are in a high-rise (above 20 floors), know that wind speed increases with height. The building will sway -- this is designed and normal. Stay in the building core (near elevator shafts and stairwells) which is structurally strongest.',
        'Never use charcoal grills, camp stoves, or generators indoors. Carbon monoxide poisoning kills more people after storms than the storms themselves. Operate generators at least 6 meters from any building opening.',
        'If driving when the typhoon hits (you should not be), pull over away from trees, poles, and overpasses. Stay in the vehicle. Do not park on bridges. Do not drive through any water covering the road -- 30cm of moving water can sweep away a car.',
        'Keep refrigerator and freezer closed. A full freezer holds temperature for 48 hours; half-full for 24 hours. Consume perishable food first if power is out.',
        'If an official evacuation order is issued, comply immediately. Do not wait for confirmation. Bring only your emergency kit, essential documents, medications, and pet supplies. Lock your home and leave.',
      ],
    },
    {
      title: 'After Passage -- Recovery & Safety', color: '#4ade80',
      items: [
        'Wait for the official all-clear announcement before going outside. The calm after the eye or tail band can be deceptively short. Verify via radio or official WeChat that the typhoon has fully passed.',
        'Stay clear of downed power lines, poles, and any wires touching water. Assume all downed lines are live. Report to 95598 (State Grid). Do not touch any metal objects near downed lines.',
        'Do not drink tap water until authorities declare it safe. Boil water for at least 1 minute (3 minutes above 1,000m elevation) or use water purification tablets. Floodwater contaminates municipal supplies with sewage, chemicals, and bacteria.',
        'Inspect your home for structural damage before entering. Look for gas leaks (smell), electrical hazards (sparks, buzzing), foundation cracks, and roof damage. If you smell gas, leave immediately and call 119 from outside.',
        'Document all damage with photographs and video before cleaning up. This is essential for insurance claims. Photograph water lines on walls to show flood depth. Keep receipts for all repair materials and temporary housing.',
        'Wear protective gear during cleanup: sturdy boots, rubber gloves, N95 mask, eye protection. Floodwater contains sewage, bacteria, chemicals, and sharp debris. Treat all floodwater as contaminated.',
        'Remove standing water immediately. Use buckets, pumps, or wet/dry vacuums. Standing water breeds mosquitoes (dengue risk) and mold within 24--48 hours. Open windows and use fans to ventilate once it is safe.',
        'Discard any food (including refrigerated and frozen) that has been above 5 degrees Celsius for more than 4 hours. Discard any food that contacted floodwater, including canned goods with damaged seals. When in doubt, throw it out.',
        'Mold remediation: remove porous materials (carpet, drywall, insulation) that were wet for 48+ hours. Clean hard surfaces with detergent and water, then disinfect with bleach solution (1 cup bleach per 4L water). Never mix bleach with ammonia.',
        'Check on neighbors, especially elderly residents, people with disabilities, and families with young children. They may need help with cleanup, medical needs, or simply verification that they survived.',
        'Avoid disaster areas unless you are volunteering with an authorized organization. Curiosity impedes rescue operations. If you want to help, donate to the Red Cross or register with Shanghai Volunteer Association.',
        'Be aware of post-storm mental health. Anxiety, insomnia, and emotional exhaustion are normal after surviving a typhoon. Talk to family, friends, or call the Shanghai Psychological Assistance Hotline at 12320-5.',
        'Stay informed about secondary hazards: landslides (none in Shanghai proper but possible in Zhejiang/Fujian), dam releases upstream on the Yangtze affecting river levels, and disease outbreaks from contaminated water.',
      ],
    },
  ];

  return (
    <div style={{ marginTop: 8 }}>
      {/* Phase cards -- full width stacked */}
      {phases.map((p, i) => (
        <div key={i} className="phase-card" style={{ borderTop: `4px solid ${p.color}`, marginBottom: 16 }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 16px', color: p.color }}>{p.title}</h3>
          <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '8px 24px' }}>
            {p.items.map((item, j) => (
              <li key={j} style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.65, marginBottom: 4 }}>{item}</li>
            ))}
          </ul>
        </div>
      ))}

      {/* Room-by-room guide */}
      <div style={{ marginTop: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e5e7eb', marginBottom: 14 }}>Room-by-Room Typhoon Preparation Checklist</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {[
            { room: 'Living Room', color: '#38bdf8', steps: ['Move furniture away from windows', 'Cover sofas and electronics with plastic sheeting', 'Unplug TV, audio, gaming equipment', 'Store loose decorative items in cabinets', 'Move potted plants indoors', 'Close curtains/blinds fully'] },
            { room: 'Kitchen', color: '#f59e0b', steps: ['Fill water containers and freeze water bottles', 'Turn off gas valve if flooding expected', 'Move small appliances to high shelves', 'Secure refrigerator doors with strap or tape', 'Discard perishables if power out >4h post-storm', 'Keep manual can opener accessible'] },
            { room: 'Bedroom', color: '#a78bfa', steps: ['Move beds away from windows (2m minimum)', 'Keep flashlight and shoes under each bed', 'Charge phone and power bank on nightstand', 'Prepare a go-bag near the door', 'Keep battery radio on nightstand', 'Place mattress against window if glass breaks'] },
            { room: 'Bathroom', color: '#4ade80', steps: ['Fill bathtub with water for flushing/sanitation', 'This is often the structurally safest room', 'Keep first aid kit in bathroom cabinet', 'Store towels to block under-door drafts', 'Have bucket and plastic bags for waste if water stops', 'Keep bleach for disinfection'] },
            { room: 'Balcony / Terrace', color: '#f87171', steps: ['Remove ALL items -- furniture, plants, racks', 'Secure or remove air conditioner external units', 'Check drainage outlets are clear of debris', 'Close and lock all sliding doors', 'Apply tape cross-hatch to glass doors', 'Do NOT go onto balcony during storm'] },
            { room: 'Utility / Storage', color: '#6b7280', steps: ['Move chemicals and cleaning products high', 'Check circuit breaker panel location', 'Know how to shut off main water valve', 'Store tools for post-storm repairs accessible', 'Keep tarpaulin and duct tape ready', 'Charge all power tool batteries'] },
          ].map((r, i) => (
            <div key={i} className="phase-card" style={{ borderTop: `3px solid ${r.color}`, padding: 16 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px', color: r.color }}>{r.room}</h4>
              <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
                {r.steps.map((s, j) => <li key={j} style={{ marginBottom: 3 }}>{s}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* What to do if typhoon strikes your home -- specific scenarios */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e5e7eb', marginBottom: 14 }}>If the Typhoon Strikes Your Home -- Scenario Response</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
          {[
            {
              scenario: 'Window breaks during storm',
              color: '#f87171',
              response: 'Stay low, move to another room, close the door behind you. Place a mattress or heavy furniture against the door to that room. Do not attempt to board up the window during high winds. If you must stay in the room, get below the window line and cover yourself with a mattress. Call property management or 119 only after winds subside.',
            },
            {
              scenario: 'Water entering through doors/windows',
              color: '#38bdf8',
              response: 'Place towels, blankets, or plastic sheeting at the base of doors. Use duct tape to seal around door frames. Move valuables and electronics to higher surfaces. If water rises above ankle level and continues rising, move to a higher floor. Do not wade through floodwater if electrical outlets or appliances are submerged.',
            },
            {
              scenario: 'Power goes out',
              color: '#fbbf24',
              response: 'Turn off and unplug all major appliances to prevent surge damage when power returns. Leave one light switch ON so you know when power is restored. Use flashlights, NOT candles (fire hazard in windy conditions with potential gas leaks). Keep refrigerator and freezer closed. Use generator outdoors only, 6m from building.',
            },
            {
              scenario: 'Gas smell detected',
              color: '#f97316',
              response: 'DO NOT turn on/off any electrical switches. DO NOT use phone, flashlight, matches, or any spark-producing device inside. If wind has subsided, open windows to ventilate. Turn off gas at the main meter valve (outside or in utility closet). Evacuate immediately. Call 119 from outside the building.',
            },
            {
              scenario: 'Structural damage (cracks, leaning, roof damage)',
              color: '#ef4444',
              response: 'Evacuate that part of the building immediately. Move to the structurally strongest area -- interior load-bearing walls, building core, stairwell (never elevator). In a house, the bathroom is often the strongest room due to pipe-reinforced walls. If ceiling begins to sag, get out of that room. Call emergency services if the building is at risk of partial collapse.',
            },
            {
              scenario: 'Trapped in a high-rise during peak winds',
              color: '#a78bfa',
              response: 'Stay in the building core -- near elevator shafts and stairwells. Do NOT use elevators (power loss risk). The building is designed to sway -- this is normal. Sit or lie on the floor away from windows. Keep your emergency kit within reach. Monitor building PA system if available. If building evacuation is announced, use stairs only. Move methodically, not running.',
            },
          ].map((s, i) => (
            <div key={i} className="phase-card" style={{ borderLeft: `4px solid ${s.color}`, padding: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px', color: s.color }}>{s.scenario}</h4>
              <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.65, margin: 0 }}>{s.response}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency kit + warning levels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div>
          <div className="section-header"><h3 className="section-title">Emergency Kit Checklist</h3></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
            {[
              ['Drinking Water', '4L/person/day x 3 days'], ['Non-perishable Food', '3-day supply minimum'], ['Flashlight (LED)', '2+ units, spare batteries'], ['Hand-crank Radio', 'AM/FM, 1 unit'],
              ['First Aid Kit', 'Include prescription meds'], ['Power Bank', '20,000mAh+, fully charged x 2'], ['ID & Insurance Copies', 'Sealed waterproof bag'], ['Rain Gear & Warm Clothes', '1 set per person'],
              ['N95 / Dust Masks', '3+ per person'], ['Multi-tool / Utility Knife', '1 unit'], ['Water Purification Tablets', '50+ tablets'], ['Emergency Blanket', '2+ mylar blankets'],
              ['Cash (small bills)', 'ATMs may be offline'], ['Whistle', 'For signaling if trapped'], ['Duct Tape & Plastic Sheeting', 'For emergency repairs'], ['Pet Supplies', 'Food, water, carrier, leash'],
            ].map(([n, d], i) => (
              <div key={i} className="kit-card"><div style={{ fontSize: 13, fontWeight: 600 }}>{n}</div><div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>{d}</div></div>
            ))}
          </div>
        </div>
        <div>
          <div className="section-header"><h3 className="section-title">CMA Typhoon Warning Levels</h3></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { color: '#3b82f6', level: 'IV', title: 'Blue Warning', desc: 'Tropical cyclone expected within 24h; average wind Force 6+ (39+ km/h)', action: 'Monitor forecasts; secure loose outdoor items; normal activities with caution' },
              { color: '#eab308', level: 'III', title: 'Yellow Warning', desc: 'Tropical cyclone expected within 24h; average wind Force 8+ (62+ km/h)', action: 'Suspend outdoor activities and gatherings; secure doors/windows; schools on alert' },
              { color: '#f97316', level: 'II', title: 'Orange Warning', desc: 'Tropical cyclone expected within 12h; average wind Force 10+ (89+ km/h)', action: 'Emergency defense posture; schools close; non-essential work suspended; prepare to evacuate' },
              { color: '#ef4444', level: 'I', title: 'Red Warning', desc: 'Tropical cyclone expected within 6h; average wind Force 12+ (118+ km/h)', action: 'Maximum defense posture; all work/school suspended; immediate evacuation of at-risk zones' },
            ].map((w, i) => (
              <div key={i} className="warning-card" style={{ borderLeft: `4px solid ${w.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="warning-level-badge" style={{ background: w.color }}>{w.level}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{w.title}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{w.desc}</div>
                    <div style={{ fontSize: 11, color: w.color, marginTop: 4, fontWeight: 600 }}>{w.action}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Water purification guide */}
      <div style={{ marginTop: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#e5e7eb', marginBottom: 14 }}>Emergency Water Purification Methods</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {[
            { method: 'Boiling', color: '#f87171', steps: 'Bring water to a rolling boil for at least 1 minute (3 minutes at elevations above 1,000m). Let cool naturally. Boiling kills bacteria, viruses, and parasites. Does not remove chemical contaminants or sediment. Use after filtering cloudy water through a clean cloth.' },
            { method: 'Bleach (Sodium Hypochlorite)', color: '#38bdf8', steps: 'Use regular unscented household bleach (5--6% sodium hypochlorite). Add 2 drops per liter of clear water, or 4 drops per liter of cloudy water. Stir and let stand 30 minutes. Water should have a faint chlorine smell. If not, repeat once. Do NOT use scented, color-safe, or splash-less bleach.' },
            { method: 'Water Purification Tablets', color: '#4ade80', steps: 'Follow manufacturer instructions. Typically 1 tablet per liter, shake, and wait 30 minutes. Tablets usually contain chlorine dioxide or iodine. Iodine is not suitable for pregnant women or people with thyroid conditions. Chlorine dioxide is effective against Cryptosporidium.' },
            { method: 'Solar Disinfection (SODIS)', color: '#fbbf24', steps: 'Fill clear PET plastic bottles with clear water. Shake to oxygenate. Place in direct sunlight for at least 6 hours (or 2 days if cloudy). UV-A radiation kills pathogens. Only works with small volumes, clear bottles, and clear water. Not effective during typhoon overcast conditions -- use as backup only.' },
          ].map((m, i) => (
            <div key={i} className="phase-card" style={{ borderTop: `3px solid ${m.color}`, padding: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px', color: m.color }}>{m.method}</h4>
              <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.65, margin: 0 }}>{m.steps}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// TAB 3: FACILITIES MAP + LIST
// ═══════════════════════════════════════════════════════════════════
const FacilitiesView: React.FC = () => {
  const [filter, setFilter] = useState<string>('all');
  const categories = Object.entries(CAT);
  const filtered = filter === 'all' ? SHANGHAI_FACILITIES : SHANGHAI_FACILITIES.filter(f => f.category === filter);

  return (
    <div style={{ marginTop: 8 }}>
      <div className="section-header" style={{ marginBottom: 14 }}>
        <h3 className="section-title">Shanghai Facilities Map ({filtered.length} locations)</h3>
        <a href="https://www.google.com/maps/dir/?api=1&destination=31.230,121.470" target="_blank" rel="noopener noreferrer" className="nav-pill">Open Google Maps</a>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={`filter-chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Facilities</button>
        {categories.map(([key, cat]) => (
          <button key={key} className={`filter-chip ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)} style={{ borderColor: filter === key ? cat.color : undefined }}>
            <span className="facility-dot" style={{ background: cat.color, display: 'inline-block', width: 8, height: 8, borderRadius: '50%', marginRight: 5 }} />
            {cat.label} ({SHANGHAI_FACILITIES.filter(f => f.category === key).length})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 16 }}>
        <div style={{ height: 620, borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
          <Suspense fallback={<div className="map-placeholder"><div className="loading-spinner" /></div>}>
            <LeafletMap
              center={{ lat: 31.23, lon: 121.47 }}
              bbox={{ south: 30.70, north: 31.70, west: 120.85, east: 122.00 }}
              facilities={filtered}
              impactZones={SHANGHAI_IMPACT_ZONES}
              showRadar={false}
              showFacilitiesOnly={true}
            />
          </Suspense>
        </div>

        <div style={{ maxHeight: 620, overflowY: 'auto' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map((f, i) => {
              const cat = CAT[f.category];
              return (
                <div key={i} className="shelter-detail-card" style={{ borderLeft: `4px solid ${cat.color}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <MarkerIcon color={cat.color}>{cat.marker}</MarkerIcon>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{f.name}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 6 }}>{f.addr}</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ color: cat.color, fontWeight: 600 }}>{cat.label}</span>
                        <span style={{ color: '#9ca3af' }}>{f.info}</span>
                        {f.phone && <span style={{ color: '#6b7280' }}>Tel: {f.phone}</span>}
                      </div>
                    </div>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lon}`} target="_blank" rel="noopener noreferrer" className="nav-pill">Navigate</a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// TAB 4: EMERGENCY CONTACTS
// ═══════════════════════════════════════════════════════════════════
const EmergencyContacts: React.FC = () => (
  <div style={{ marginTop: 8 }}>
    <div className="alert-banner">
      If you are in immediate danger, dial emergency numbers now. Save these contacts to your phone. Share with family members. Print a physical copy and place it in your emergency kit.
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 16 }}>
      {[
        ['Police', '110', 'Crime, violence, theft, any life-threatening emergency'], ['Fire Brigade', '119', 'Fire, explosion, hazardous materials, gas leaks, rescue'],
        ['Ambulance / EMS', '120', 'Medical emergency, injury, casualty transport'], ['Traffic Police', '122', 'Road traffic accident, blocked highway, bridge incident'],
        ['Maritime Rescue', '12395', 'Sea/river distress, China Maritime Safety Administration'], ['Red Cross Emergency', '999', 'Red Cross Society emergency rescue hotline'],
        ['State Grid Power', '95598', 'Power outage reporting, downed lines, electrical hazard'], ['Citizen Service Hotline', '12345', 'Municipal services, water, drainage, fallen trees, road debris'],
        ['Flood Control (MWR)', '12314', 'Ministry of Water Resources flood and drought hotline'], ['Weather Forecast', '12121', '24-hour automated weather forecast, typhoon updates'],
        ['Emergency Management', '12350', 'Workplace safety, hazardous materials, emergency consultation'], ['Shanghai Gas', '962777', 'Shanghai Gas Group emergency, gas leak reporting'],
        ['Shanghai Water Supply', '962740', 'Shanghai Water Supply Company, pipe bursts, contamination'], ['Mental Health Hotline', '12320-5', 'Shanghai Psychological Assistance, post-disaster counselling'],
      ].map(([title, num, desc], i) => (
        <div key={i} className="contact-card">
          <div style={{ fontSize: 13, color: '#9ca3af', marginBottom: 4 }}>{title}</div>
          <div className="contact-number">{num}</div>
          <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>{desc}</div>
        </div>
      ))}
    </div>
    <div style={{ marginTop: 28 }}>
      <h3 className="section-title">Emergency Management Bureaus</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 8, marginTop: 12 }}>
        {[
          ['Shanghai Emergency Management Bureau', '021-54667699'], ['Shanghai Flood Control Headquarters', '021-63237910'],
          ['Shanghai Meteorological Bureau', '021-54896100'], ['Shanghai Civil Affairs Bureau (Disaster Relief)', '021-63232222'],
          ['Shanghai Water Authority (Drainage)', '021-52398519'], ['Shanghai Housing & Urban-Rural Construction', '021-12319'],
          ['Zhejiang Emergency Management Department', '0571-87053660'], ['Fujian Emergency Management Department', '0591-87521854'],
          ['Jiangsu Emergency Management Department', '025-83329696'], ['National Emergency Management Ministry', '010-83986000'],
          ['China Meteorological Administration', '010-68406114'], ['Ministry of Civil Affairs -- Disaster Relief', '010-58123114'],
        ].map(([r, p], i) => (
          <div key={i} className="region-contact-card">
            <div style={{ fontSize: 13, fontWeight: 600 }}>{r}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#38bdf8', marginTop: 4 }}>{p}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════════
const TABS = [
  { key: 'live' as const, label: 'Live Monitor' },
  { key: 'guide' as const, label: 'Preparedness Guide' },
  { key: 'facilities' as const, label: 'Facilities Map' },
  { key: 'contacts' as const, label: 'Emergency Contacts' },
];

const Home: React.FC = () => {
  const [tab, setTab] = useState<'live' | 'guide' | 'facilities' | 'contacts'>('live');
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="topbar-brand">
            <span className="topbar-title">Typhoon Monitor</span>
            <span className="topbar-divider">|</span>
            <span className="topbar-subtitle">BAVI -- Shanghai Focus</span>
          </div>
          <div className="topbar-status">
            <span className="status-pulse" />
            <span style={{ fontSize: 12, color: '#f87171', fontWeight: 600 }}>Severe Typhoon Warning</span>
            <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 8 }}>
              Projected landfall 7/11, Shanghai impact ~12:00 CST -- <LiveClock />
            </span>
          </div>
        </div>
      </header>
      <nav className="tabbar">
        <div className="tabbar-inner">
          {TABS.map((t) => (
            <button key={t.key} className={`tab ${tab === t.key ? 'tab--active' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="content">
        {tab === 'live' && <TyphoonLive />}
        {tab === 'guide' && <PreparednessGuide />}
        {tab === 'facilities' && <FacilitiesView />}
        {tab === 'contacts' && <EmergencyContacts />}
      </main>
      <footer className="footer">
        <div className="footer-inner">
          <span>Data: CMA / JMA / Open-Meteo / RainViewer / Windy / OSM</span>
          <span className="footer-divider">|</span>
          <span>Updated: <LiveClock /> CST</span>
          <span className="footer-divider">|</span>
          <span style={{ color: '#6b7280' }}>Reference only; always follow official directives</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
