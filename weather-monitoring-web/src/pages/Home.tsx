import React, { useState, useEffect, Suspense } from 'react';
import { useWeather } from '../hooks/useWeather';

const LeafletMap = React.lazy(() => import('../components/LeafletMap'));

// Typhoon BAVI approximate path data (lat, lon, timestamp, category, windSpeed km/h, pressure hPa)
const BAVI_TRACK = [
  { lat: 13.5, lon: 131.2, time: '7/8 06:00', cat: '热带低压', wind: 55, pressure: 1002, label: '形成' },
  { lat: 15.8, lon: 129.5, time: '7/8 18:00', cat: '热带风暴', wind: 75, pressure: 995, label: '加强' },
  { lat: 18.2, lon: 127.8, time: '7/9 06:00', cat: '强热带风暴', wind: 95, pressure: 985, label: '' },
  { lat: 20.5, lon: 126.0, time: '7/9 18:00', cat: '台风', wind: 130, pressure: 965, label: '台风级' },
  { lat: 22.8, lon: 124.2, time: '7/10 06:00', cat: '强台风', wind: 155, pressure: 945, label: '逼近东海' },
  { lat: 25.0, lon: 122.5, time: '7/10 18:00', cat: '强台风', wind: 165, pressure: 935, label: '⚠️ 当前' },
  { lat: 27.2, lon: 120.8, time: '7/11 06:00', cat: '台风', wind: 140, pressure: 955, label: '预计登陆' },
  { lat: 29.5, lon: 119.0, time: '7/11 18:00', cat: '强热带风暴', wind: 100, pressure: 975, label: '内陆减弱' },
  { lat: 31.8, lon: 117.2, time: '7/12 06:00', cat: '热带风暴', wind: 70, pressure: 990, label: '继续减弱' },
  { lat: 34.0, lon: 115.5, time: '7/12 18:00', cat: '热带低压', wind: 50, pressure: 998, label: '消散' },
];

// Cities likely in typhoon path
const AFFECTED_CITIES = [
  { name: '上海', en: 'Shanghai', lat: 31.23, lon: 121.47 },
  { name: '宁波', en: 'Ningbo', lat: 29.87, lon: 121.54 },
  { name: '温州', en: 'Wenzhou', lat: 28.02, lon: 120.65 },
  { name: '福州', en: 'Fuzhou', lat: 26.07, lon: 119.30 },
  { name: '台北', en: 'Taipei', lat: 25.03, lon: 121.57 },
  { name: '杭州', en: 'Hangzhou', lat: 30.25, lon: 120.17 },
  { name: '厦门', en: 'Xiamen', lat: 24.48, lon: 118.08 },
  { name: '南京', en: 'Nanjing', lat: 32.06, lon: 118.80 },
];

// Typhoon categories with colors
const CAT_COLORS: Record<string, string> = {
  '热带低压': '#00ccff',
  '热带风暴': '#00ff88',
  '强热带风暴': '#ffdd00',
  '台风': '#ff8800',
  '强台风': '#ff3333',
  '超强台风': '#cc00ff',
};

const EmergencyContacts: React.FC = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
    {[
      { title: '🚨 公安报警', number: '110', desc: '遇到危险、盗窃、暴力等紧急情况' },
      { title: '🔥 火警', number: '119', desc: '火灾、爆炸、危险品泄漏等' },
      { title: '🚑 急救中心', number: '120', desc: '医疗急救、伤员转运' },
      { title: '🚗 交通事故', number: '122', desc: '道路交通事故报警' },
      { title: '🌊 海上救援', number: '12395', desc: '海上遇险求救（中国海事局）' },
      { title: '🏥 红十字会', number: '999', desc: '红十字会紧急救援' },
      { title: '⚡ 电力抢修', number: '95598', desc: '国家电网客服/电力故障报修' },
      { title: '💧 供水抢修', number: '12345', desc: '市民服务热线（供水/市政）' },
      { title: '🌪️ 防汛抗旱', number: '12314', desc: '水利部防汛抗旱热线' },
      { title: '📡 天气预报', number: '12121', desc: '24小时天气预报查询' },
      { title: '🏛️ 应急管理部', number: '12350', desc: '安全生产举报/应急咨询' },
      { title: '🆘 综合救援', number: '119', desc: '地震、洪水、台风等自然灾害救援' },
    ].map((item, i) => (
      <div key={i} className="emergency-card">
        <div className="emergency-title">{item.title}</div>
        <div className="emergency-number">{item.number}</div>
        <div className="emergency-desc">{item.desc}</div>
      </div>
    ))}
  </div>
);

const PreparednessGuide: React.FC = () => {
  const phases = [
    {
      phase: '🔵 台风来临前',
      items: [
        '密切关注气象部门发布的台风预警信息，了解台风路径和强度变化。',
        '检查房屋门窗是否牢固，必要时用木板或胶带加固玻璃窗。',
        '清理阳台、屋顶上的花盆、杂物等容易被风吹落的物品。',
        '准备应急物资：饮用水（每人每天至少3升，储备3-5天）、干粮、手电筒、电池、急救药品、充电宝。',
        '车辆加满油或充满电，停放在地势较高、远离树木和广告牌的安全位置。',
        '了解所在社区的避难所位置和疏散路线。',
        '检查排水管道是否畅通，清理下水道口的杂物。',
        '低洼地区居民做好转移准备，听从当地政府安排。',
      ],
    },
    {
      phase: '🔴 台风来临时',
      items: [
        '留在室内，远离门窗，切勿外出！',
        '将室内的贵重物品和电器搬到高处，防止进水损坏。',
        '关闭燃气阀门和电源总开关（如可能进水）。',
        '用浴缸、水桶等储水，以备停水之需。',
        '持续关注官方发布的台风动态和预警信息（收音机、手机）。',
        '如房屋开始进水，立即转移到更高楼层或安全地点。',
        '切勿在河边、海边、桥上逗留或驾车。',
        '如遇停电，使用手电筒照明，切勿使用蜡烛以防火灾。',
        '如果官方发布撤离命令，立即执行，不要犹豫！',
      ],
    },
    {
      phase: '🟢 台风过后',
      items: [
        '确认官方发布"安全"通知后再外出。',
        '远离倒塌的电线杆、电线，防止触电。',
        '不要饮用未经处理的水源，防止疾病传播。',
        '检查房屋结构是否受损，拍照留存以备保险理赔。',
        '清理积水和淤泥，防止蚊虫滋生。',
        '注意饮食卫生，不吃被水浸泡过的食物。',
        '帮助邻居特别是老人、儿童和残疾人。',
        '配合政府和救援人员的灾后恢复工作。',
      ],
    },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      {phases.map((p, i) => (
        <div key={i} className="guide-phase">
          <h3 className="guide-phase-title">{p.phase}</h3>
          <ul className="guide-list">
            {p.items.map((item, j) => (
              <li key={j} className="guide-item">{item}</li>
            ))}
          </ul>
        </div>
      ))}

      <div className="guide-phase" style={{ marginTop: 24 }}>
        <h3 className="guide-phase-title">🎒 应急包清单</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
          {[
            { icon: '💧', item: '饮用水', qty: '每人3-5升/天 × 3天' },
            { icon: '🍞', item: '干粮/压缩饼干', qty: '3天量' },
            { icon: '🔦', item: '手电筒 + 备用电池', qty: '2个以上' },
            { icon: '📻', item: '收音机（手摇式）', qty: '1台' },
            { icon: '💊', item: '急救包/常用药品', qty: '1套' },
            { icon: '🔋', item: '充电宝（满电）', qty: '2个以上' },
            { icon: '📄', item: '重要证件复印件', qty: '密封防水保存' },
            { icon: '🧥', item: '保暖衣物/雨衣', qty: '每人1套' },
            { icon: '🪣', item: '水桶/折叠水袋', qty: '2个' },
            { icon: '🧻', item: '湿巾/卫生纸', qty: '适量' },
            { icon: '🪒', item: '多功能工具刀', qty: '1把' },
            { icon: '😷', item: '口罩/防尘面罩', qty: '每人3个以上' },
          ].map((kit, i) => (
            <div key={i} className="kit-card">
              <span style={{ fontSize: 28 }}>{kit.icon}</span>
              <div><strong>{kit.item}</strong></div>
              <div style={{ color: '#9ca3af', fontSize: 13 }}>{kit.qty}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="guide-phase" style={{ marginTop: 24 }}>
        <h3 className="guide-phase-title">⚠️ 台风预警等级说明</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {[
            { color: '#0066ff', level: '蓝色预警', meaning: '24小时内可能受热带气旋影响，平均风力6级以上', action: '关注天气预报，做好基本防范准备' },
            { color: '#ffdd00', level: '黄色预警', meaning: '24小时内可能受热带气旋影响，平均风力8级以上', action: '停止户外集会活动，加固门窗和室外物品' },
            { color: '#ff8800', level: '橙色预警', meaning: '12小时内可能受热带气旋影响，平均风力10级以上', action: '进入紧急防风状态，停止大型集会，学校停课' },
            { color: '#ff0000', level: '红色预警', meaning: '6小时内可能受热带气旋影响，平均风力12级以上', action: '立即进入最高防御状态，停工停课停业，人员转移！' },
          ].map((w, i) => (
            <div key={i} className="warning-level" style={{ borderLeftColor: w.color }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="warning-badge" style={{ background: w.color }}>{w.level}</span>
                <span style={{ fontSize: 14, color: '#d1d5db' }}>{w.meaning}</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, color: '#f87171' }}>⟶ {w.action}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface CityWeatherCardProps {
  city: { name: string; en: string; lat: number; lon: number };
  onSelect: (city: { name: string; en: string; lat: number; lon: number }) => void;
}

const CityWeatherCard: React.FC<CityWeatherCardProps> = ({ city, onSelect }) => {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current_weather=true&timezone=Asia/Shanghai`;
        const resp = await fetch(url);
        const data = await resp.json();
        if (data?.current_weather) {
          setWeather(data.current_weather);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 600000); // refresh every 10 min
    return () => clearInterval(interval);
  }, [city.lat, city.lon]);

  const windKmh = weather ? Math.round(weather.windspeed) : '--';
  const temp = weather ? Math.round(weather.temperature) : '--';
  const windLevel = weather ? Math.min(Math.ceil(weather.windspeed / 3.6 / 4), 12) : 0;
  const isDanger = typeof windKmh === 'number' && windKmh >= 60;

  return (
    <div
      className={`city-weather-card ${isDanger ? 'city-danger' : ''}`}
      onClick={() => onSelect(city)}
      style={{ cursor: 'pointer' }}
    >
      <div className="city-name">{city.name}</div>
      <div className="city-temp">{temp}°C</div>
      <div className="city-wind">
        💨 {windKmh} km/h
        {typeof windKmh === 'number' && windKmh >= 60 && <span className="wind-alert"> ⚠️</span>}
      </div>
      <div className="city-wind-level">
        风力 {windLevel} 级
      </div>
    </div>
  );
};

const TyphoonTrack: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<typeof BAVI_TRACK[0] | null>(null);
  const [mapCenter] = useState<{ lat: number; lon: number }>({ lat: 25.0, lon: 122.5 });
  const [viewMode, setViewMode] = useState<'track' | 'windy'>('track');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 18, fontWeight: 700, color: '#ff4444' }}>
          🌀 台风巴威 (BAVI) — 当前等级：强台风
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button
            onClick={() => setViewMode('track')}
            className={`view-toggle-btn ${viewMode === 'track' ? 'active' : ''}`}
          >
            🗺️ 路径图
          </button>
          <button
            onClick={() => setViewMode('windy')}
            className={`view-toggle-btn ${viewMode === 'windy' ? 'active' : ''}`}
          >
            🌐 Windy实时风场
          </button>
        </div>
      </div>

      {viewMode === 'windy' ? (
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,60,60,0.3)' }}>
          <iframe
            title="Windy Typhoon BAVI"
            src="https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=6&overlay=wind&product=ecmwf&level=surface&lat=26.5&lon=123.5&detailLat=25.0&detailLon=122.5&detail=true&pressure=true"
            width="100%"
            height="550"
            style={{ border: 0 }}
            loading="lazy"
          />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,60,60,0.3)', height: 500 }}>
            <Suspense fallback={<div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f18' }}>加载地图中...</div>}>
              <LeafletMap
                center={mapCenter}
                bbox={{
                  south: 12,
                  north: 36,
                  west: 115,
                  east: 135,
                }}
                typhoonTrack={BAVI_TRACK}
                onPointClick={(p: any) => setSelectedPoint(p)}
              />
            </Suspense>
          </div>

          <div className="track-info-panel">
            <h4 style={{ margin: '0 0 12px 0', color: '#ff6b6b', fontSize: 16 }}>📊 台风路径数据</h4>
            <div className="track-timeline">
              {BAVI_TRACK.map((point, i) => {
                const isCurrent = point.label.includes('当前');
                const isPast = i <= 5;
                return (
                  <div
                    key={i}
                    className={`track-point ${isCurrent ? 'track-current' : ''} ${isPast ? 'track-past' : 'track-future'}`}
                    onClick={() => setSelectedPoint(point)}
                  >
                    <div className="track-point-marker" style={{
                      background: isPast ? '#ff6b6b' : '#ffaa00',
                      boxShadow: isCurrent ? '0 0 16px #ff0000' : undefined,
                    }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{point.time}</div>
                      <div style={{ fontSize: 12, color: CAT_COLORS[point.cat] || '#ccc' }}>
                        {point.cat} · {point.wind}km/h · {point.pressure}hPa
                      </div>
                      {point.label && (
                        <div style={{ fontSize: 11, color: isCurrent ? '#ff4444' : '#f59e0b', fontWeight: isCurrent ? 700 : 400 }}>
                          {point.label}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedPoint && (
              <div className="selected-point-detail">
                <h5 style={{ margin: '0 0 8px 0', color: '#ffaa00' }}>📍 {selectedPoint.time} 详情</h5>
                <div>位置: {selectedPoint.lat.toFixed(1)}°N, {selectedPoint.lon.toFixed(1)}°E</div>
                <div>等级: {selectedPoint.cat}</div>
                <div>最大风速: {selectedPoint.wind} km/h</div>
                <div>中心气压: {selectedPoint.pressure} hPa</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const SheltersMap: React.FC = () => {
  // Approximate shelter locations in coastal cities
  const shelters = [
    { name: '上海市体育馆避难所', lat: 31.18, lon: 121.44, addr: '上海市徐汇区漕溪北路1111号', capacity: '可容纳 5000 人' },
    { name: '宁波市国际会展中心', lat: 29.87, lon: 121.62, addr: '宁波市鄞州区会展路181号', capacity: '可容纳 3000 人' },
    { name: '温州市体育中心', lat: 28.00, lon: 120.68, addr: '温州市鹿城区民航路6号', capacity: '可容纳 4000 人' },
    { name: '福州市海峡国际会展中心', lat: 26.03, lon: 119.36, addr: '福州市仓山区城门镇南江滨西大道', capacity: '可容纳 6000 人' },
    { name: '杭州市奥体中心', lat: 30.23, lon: 120.23, addr: '杭州市滨江区飞虹路', capacity: '可容纳 8000 人' },
    { name: '厦门市工人体育馆', lat: 24.47, lon: 118.10, addr: '厦门市思明区体育路95号', capacity: '可容纳 3000 人' },
    { name: '台北市小巨蛋', lat: 25.05, lon: 121.55, addr: '台北市松山区南京东路四段2号', capacity: '可容纳 10000 人' },
    { name: '南京市奥体中心', lat: 32.01, lon: 118.72, addr: '南京市建邺区江东中路222号', capacity: '可容纳 8000 人' },
  ];

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '2px solid rgba(255,60,60,0.3)', height: 500 }}>
          <Suspense fallback={<div style={{ height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f18' }}>加载地图中...</div>}>
            <LeafletMap
              center={{ lat: 28.0, lon: 121.0 }}
              bbox={{ south: 22, north: 34, west: 116, east: 124 }}
              shelters={shelters}
            />
          </Suspense>
        </div>
        <div>
          <h4 style={{ margin: '0 0 12px 0', color: '#ffaa00', fontSize: 16 }}>🏥 避难所列表</h4>
          <div style={{ maxHeight: 460, overflowY: 'auto' }}>
            {shelters.map((s, i) => (
              <div key={i} className="shelter-card">
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fbbf24' }}>{s.name}</div>
                <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>📍 {s.addr}</div>
                <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>👥 {s.capacity}</div>
                <div style={{ marginTop: 8 }}>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lon}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link-btn"
                  >
                    🧭 导航到此
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'guide' | 'shelters' | 'contacts'>('live');
  const [selectedCity, setSelectedCity] = useState<{ name: string; en: string; lat: number; lon: number } | null>(null);
  const { weatherData, fetchWeather, loading } = useWeather();

  const handleCitySelect = async (city: { name: string; en: string; lat: number; lon: number }) => {
    setSelectedCity(city);
    await fetchWeather(city.en);
  };

  const tabs = [
    { key: 'live' as const, icon: '🌀', label: '台风实况' },
    { key: 'guide' as const, icon: '📋', label: '防灾指南' },
    { key: 'shelters' as const, icon: '🏥', label: '避难所' },
    { key: 'contacts' as const, icon: '📞', label: '紧急联络' },
  ];

  return (
    <div className="typhoon-app">
      {/* Header */}
      <header className="typhoon-header">
        <div className="header-top">
          <div className="header-alert">
            <span className="alert-pulse" />
            <span>⚠️ 强台风巴威 (BAVI) 紧急预警 — 预计7月11日凌晨登陆浙闽沿海</span>
          </div>
        </div>
        <h1 className="header-title">
          🌀 台风巴威 (BAVI) 实时监控与防灾信息平台
        </h1>
        <p className="header-subtitle">
          当前等级：<span style={{ color: '#ff3333', fontWeight: 700 }}>强台风</span> ·
          最大风速：<span style={{ color: '#ff8800' }}>165 km/h</span> ·
          中心气压：<span style={{ color: '#ff8800' }}>935 hPa</span> ·
          移动方向：<span style={{ color: '#ffaa00' }}>西北偏西</span>
        </p>
      </header>

      {/* Tabs */}
      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <main className="tab-content">
        {/* Tab 1: Typhoon Live */}
        {activeTab === 'live' && (
          <div>
            <TyphoonTrack />

            {/* Affected cities weather */}
            <section style={{ marginTop: 24 }}>
              <h3 style={{ color: '#f59e0b', fontSize: 18, marginBottom: 12 }}>
                🌆 受影响城市实时天气
              </h3>
              <div className="city-grid">
                {AFFECTED_CITIES.map((city, i) => (
                  <CityWeatherCard
                    key={i}
                    city={city}
                    onSelect={handleCitySelect}
                  />
                ))}
              </div>
            </section>

            {/* Selected city detail */}
            {selectedCity && (
              <section style={{ marginTop: 20 }}>
                <h3 style={{ color: '#f59e0b', fontSize: 16, marginBottom: 8 }}>
                  📍 {selectedCity.name} 详细天气
                  {loading && <span style={{ marginLeft: 8, color: '#9ca3af', fontSize: 13 }}>加载中...</span>}
                </h3>
                {weatherData && (
                  <div className="weather-detail-card">
                    <div className="weather-stat">
                      <span className="weather-stat-label">🌡️ 温度</span>
                      <span className="weather-stat-value">{weatherData.temperature}°C</span>
                    </div>
                    <div className="weather-stat">
                      <span className="weather-stat-label">💧 湿度</span>
                      <span className="weather-stat-value">{weatherData.humidity}%</span>
                    </div>
                    <div className="weather-stat">
                      <span className="weather-stat-label">🌤️ 天气</span>
                      <span className="weather-stat-value">{weatherData.conditions}</span>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* Tab 2: Preparedness Guide */}
        {activeTab === 'guide' && <PreparednessGuide />}

        {/* Tab 3: Shelters */}
        {activeTab === 'shelters' && <SheltersMap />}

        {/* Tab 4: Emergency Contacts */}
        {activeTab === 'contacts' && (
          <div style={{ marginTop: 16 }}>
            <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <p style={{ margin: 0, color: '#ff8888', fontSize: 15, lineHeight: 1.6 }}>
                ⚠️ <strong>紧急提醒：</strong>如遇生命危险，请立即拨打 <strong style={{ fontSize: 20, color: '#ff0000' }}>110</strong>、<strong style={{ fontSize: 20, color: '#ff0000' }}>119</strong> 或 <strong style={{ fontSize: 20, color: '#ff0000' }}>120</strong>！
                请将以下紧急联络方式保存到手机通讯录，并告知家人。
              </p>
            </div>
            <EmergencyContacts />

            <div className="guide-phase" style={{ marginTop: 32 }}>
              <h3 className="guide-phase-title">🏛️ 各省市应急管理局联系方式</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 10, marginTop: 12 }}>
                {[
                  { region: '浙江省应急管理厅', phone: '0571-87053660' },
                  { region: '福建省应急管理厅', phone: '0591-87521854' },
                  { region: '上海市应急管理局', phone: '021-54667699' },
                  { region: '江苏省应急管理厅', phone: '025-83329696' },
                  { region: '广东省应急管理厅', phone: '020-83135188' },
                  { region: '国家应急管理部', phone: '010-83986000' },
                  { region: '中国气象局', phone: '010-68406114' },
                  { region: '民政部救灾司', phone: '010-58123114' },
                ].map((item, i) => (
                  <div key={i} className="region-contact">
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{item.region}</div>
                    <div style={{ color: '#10b981', fontSize: 18, fontWeight: 700, marginTop: 4 }}>{item.phone}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="typhoon-footer">
        <p>⚠️ 数据来源：中国气象局 (CMA)、日本气象厅 (JMA)、Open-Meteo、Windy</p>
        <p>🕐 最后更新：{new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</p>
        <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
          免责声明：本页面提供的信息仅供参考，请以当地政府和气象部门发布的官方信息为准。遇到紧急情况请立即拨打官方救援电话。
        </p>
      </footer>
    </div>
  );
};

export default Home;
