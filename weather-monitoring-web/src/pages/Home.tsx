import React, { useState, Suspense } from 'react';
import WeatherCard from '../components/WeatherCard';
import SearchBar from '../components/SearchBar';
import { useWeather } from '../hooks/useWeather';
const ForecastChart = React.lazy(() => import('../components/ForecastChart'));
import Popup from '../components/Popup';
import DataTable from '../components/DataTable';
import LiveSparkline from '../components/LiveSparkline';
import LiveMap from '../components/LiveMap';
const LeafletMap = React.lazy(() => import('../components/LeafletMap'));

const Home: React.FC = () => {
    const { weatherData, fetchWeather, loading, error } = useWeather();
    const [popupVisible, setPopupVisible] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [comparePrev, setComparePrev] = useState(false);
    const [prevHourly, setPrevHourly] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'external'>('dashboard');
    const [externalView, setExternalView] = useState<'iframe' | 'leaflet'>('iframe');
        const [selectedCenter, setSelectedCenter] = useState<{ lat: number; lon: number } | null>(null);
        const [selectedBBox, setSelectedBBox] = useState<{ south: number; north: number; west: number; east: number } | null>(null);
        const [computedZoom, setComputedZoom] = useState<number | null>(null);

    // small curated list of big/popular cities for quick access
    const popularCities = [
        'New York, US',
        'London, UK',
        'Tokyo, JP',
        'Shanghai, CN',
        'Mumbai, IN',
        'Sydney, AU',
        'Dubai, AE',
        'Los Angeles, US',
        'Paris, FR',
        'Singapore, SG'
    ];

    // if weatherData contains hourly arrays, prepare chart data
    // our service returns an object with optional arrays named hourly?.time, hourly?.temperature_2m, hourly?.relativehumidity_2m, hourly?.windspeed_10m
    let labels: string[] = [];
    let tempData: number[] = [];
    let humData: number[] = [];
    let windData: number[] = [];

    // try to read arrays if present
    const anyHourly = (weatherData as any)?.hourly;
    if (anyHourly && Array.isArray(anyHourly.time)) {
        labels = anyHourly.time.slice(0, 24);
        tempData = (anyHourly.temperature_2m || []).slice(0, 24).map(Number);
        humData = (anyHourly.relativehumidity_2m || []).slice(0, 24).map(Number);
        windData = (anyHourly.windspeed_10m || []).slice(0, 24).map(Number);
    }

    console.debug('Home chart data', { labelsLength: labels.length, tempLen: tempData.length, humLen: humData.length, windLen: windData.length });

    return (
        <div className="home">
            <h1>Weather Monitoring</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SearchBar onSearch={fetchWeather} />
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                    <button onClick={() => setActiveTab('dashboard')} style={{ padding: '6px 10px', borderRadius: 6, background: activeTab === 'dashboard' ? '#0f1724' : '#071018', color: '#fff', border: '1px solid #23303a' }}>Dashboard</button>
                    <button onClick={() => setActiveTab('external')} style={{ padding: '6px 10px', borderRadius: 6, background: activeTab === 'external' ? '#0f1724' : '#071018', color: '#fff', border: '1px solid #23303a' }}>External Map</button>
                </div>
            </div>

            <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {popularCities.map((c) => (
                    <button key={c} onClick={async () => {
                        // fetch weather and then open external map centered on the result
                        const data: any = await fetchWeather(c);
                        if (data && data.latitude && data.longitude) {
                            setSelectedCenter({ lat: data.latitude, lon: data.longitude });
                            if (data.bbox) setSelectedBBox(data.bbox);
                            // compute a rough zoom from bbox diagonal
                            if (data.bbox) {
                                const lonDelta = Math.abs(data.bbox.east - data.bbox.west);
                                const latDelta = Math.abs(data.bbox.north - data.bbox.south);
                                const maxDelta = Math.max(lonDelta, latDelta);
                                // rough zoom table: very coarse
                                let z = 6;
                                if (maxDelta > 40) z = 3;
                                else if (maxDelta > 20) z = 4;
                                else if (maxDelta > 5) z = 6;
                                else if (maxDelta > 1) z = 8;
                                else z = 10;
                                setComputedZoom(z);
                            }
                            setActiveTab('external');
                            setExternalView('leaflet');
                        }
                    }} style={{ background: '#0b1220', color: '#fff', border: '1px solid #21303a', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>
                        {c.split(',')[0]}
                    </button>
                ))}
            </div>
            <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
                <button onClick={() => setPopupVisible(true)}>Open Popup</button>
            </div>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {weatherData && <WeatherCard data={weatherData} />}

            {activeTab === 'dashboard' && labels.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginTop: 20 }}>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }} className="controls">
                            <label style={{ color: '#9ca3af' }}>
                                <input type="checkbox" checked={showTable} onChange={() => setShowTable(v => !v)} /> Show table
                            </label>
                            <label style={{ color: '#9ca3af' }}>
                                <input type="checkbox" checked={comparePrev} onChange={async () => {
                                    const newVal = !comparePrev;
                                    setComparePrev(newVal);
                                    if (newVal && anyHourly) {
                                        // fetch previous day's hourly via our service (pastDays=1)
                                        try {
                                            const prev = await fetchWeather((weatherData as any)?.location, 1);
                                            setPrevHourly(prev?.hourly || null);
                                        } catch (e) {
                                            setPrevHourly(null);
                                        }
                                    } else {
                                        setPrevHourly(null);
                                    }
                                }} /> Compare previous
                            </label>
                        </div>

                        {!showTable ? (
                            <>
                                                                <Suspense fallback={<div>Loading charts...</div>}>
                                                                    <ForecastChart title="Temperature (next 24h)" labels={labels} dataSeries={[{ label: 'Temp °C', data: tempData, borderColor: '#ef4444' }, ...(prevHourly ? [{ label: 'Prev Temp °C', data: (prevHourly.temperature_2m || []).slice(0,24).map(Number), borderColor: '#10b981' }] : [])]} />
                                                                    <ForecastChart title="Humidity (next 24h)" labels={labels} dataSeries={[{ label: 'Humidity %', data: humData, borderColor: '#06b6d4' }, ...(prevHourly ? [{ label: 'Prev Hum %', data: (prevHourly.relativehumidity_2m || []).slice(0,24).map(Number), borderColor: '#10b981' }] : [])]} />
                                                                    <ForecastChart title="Wind Speed (next 24h)" labels={labels} dataSeries={[{ label: 'Wind m/s', data: windData, borderColor: '#f59e0b' }, ...(prevHourly ? [{ label: 'Prev Wind m/s', data: (prevHourly.windspeed_10m || []).slice(0,24).map(Number), borderColor: '#10b981' }] : [])]} />
                                                                </Suspense>
                            </>
                        ) : (
                            <>
                                <DataTable labels={labels} series={[{ label: 'Temp °C', data: tempData }]} compareSeries={prevHourly ? [{ label: 'Temp °C', data: (prevHourly.temperature_2m || []).slice(0,24).map(Number) }] : undefined} />
                                <DataTable labels={labels} series={[{ label: 'Humidity %', data: humData }]} compareSeries={prevHourly ? [{ label: 'Hum %', data: (prevHourly.relativehumidity_2m || []).slice(0,24).map(Number) }] : undefined} />
                            </>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="chart-card">
                            <h4 style={{ marginTop: 0 }}>Live Wind (last 12)</h4>
                            <LiveSparkline data={windData.slice(-12)} color="#f59e0b" height={60} />
                        </div>
                        <div className="chart-card">
                            <h4 style={{ marginTop: 0 }}>Live Precip (last 12)</h4>
                            <LiveSparkline data={((anyHourly && anyHourly.precipitation) || []).slice(-12).map(Number)} color="#3b82f6" height={60} />
                        </div>
                        <div className="chart-card">
                            <h4 style={{ marginTop: 0 }}>Live Map</h4>
                            <LiveMap windSpeeds={windData.slice(-12)} windDirs={((anyHourly && anyHourly.winddirection_10m) || []).slice(-12).map(Number)} precipitation={((anyHourly && anyHourly.precipitation) || []).slice(-12).map(Number)} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'external' && (
                <div style={{ marginTop: 20 }}>
                    <h3 style={{ marginTop: 0 }}>External Real-time Map</h3>
                    <p style={{ color: '#9ca3af', marginTop: 4 }}>Choose an external live map or the local interactive map.</p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <button onClick={() => setExternalView('iframe')} style={{ padding: '6px 10px', borderRadius: 6, background: externalView === 'iframe' ? '#0f1724' : '#071018', color: '#fff' }}>RainViewer iframe</button>
                        <button onClick={() => setExternalView('leaflet')} style={{ padding: '6px 10px', borderRadius: 6, background: externalView === 'leaflet' ? '#0f1724' : '#071018', color: '#fff' }}>Local Leaflet map</button>
                    </div>
                    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)', marginTop: 8 }}>
                        {externalView === 'iframe' ? (
                            // RainViewer supports hash params like lat,lon,zoom via their UI — we append if we have a center
                            <iframe title="RainViewer" src={`https://www.rainviewer.com/map.html#loc=${selectedCenter ? `${selectedCenter.lat},${selectedCenter.lon}` : '20,0'},4`} width="100%" height={600} style={{ border: 0 }} />
                        ) : (
                                                        <div style={{ height: 600 }}>
                                                                <Suspense fallback={<div>Loading map...</div>}>
                                                                    <LeafletMap center={selectedCenter} bbox={selectedBBox} />
                                                                </Suspense>
                                                        </div>
                        )}
                    </div>
                </div>
            )}

            <Popup title="Customize" visible={popupVisible} onClose={() => setPopupVisible(false)}>
                <div>
                    <p>Customize what data to show in the charts and popup.</p>
                    <label>
                        <input type="checkbox" defaultChecked /> Show temperature
                    </label>
                    <br />
                    <label>
                        <input type="checkbox" defaultChecked /> Show humidity
                    </label>
                    <br />
                    <label>
                        <input type="checkbox" defaultChecked /> Show wind
                    </label>
                </div>
            </Popup>
        </div>
    );
};

export default Home;