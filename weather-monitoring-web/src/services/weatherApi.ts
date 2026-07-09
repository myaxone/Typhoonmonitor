import axios from 'axios';

// We'll use Open-Meteo's free APIs for geocoding and current weather.
// Geocoding: https://geocoding-api.open-meteo.com/v1/search?name=Shanghai&count=1
// Forecast/current: https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...&current_weather=true&hourly=relativehumidity_2m&timezone=auto

function weatherCodeToText(code: number): string {
    // simplified mapping from Open-Meteo / WMO weather codes
    const map: Record<number, string> = {
        0: 'Clear sky',
        1: 'Mainly clear',
        2: 'Partly cloudy',
        3: 'Overcast',
        45: 'Fog',
        48: 'Depositing rime fog',
        51: 'Light drizzle',
        53: 'Moderate drizzle',
        55: 'Dense drizzle',
        56: 'Light freezing drizzle',
        57: 'Dense freezing drizzle',
        61: 'Slight rain',
        63: 'Moderate rain',
        65: 'Heavy rain',
        66: 'Light freezing rain',
        67: 'Heavy freezing rain',
        71: 'Slight snow fall',
        73: 'Moderate snow fall',
        75: 'Heavy snow fall',
        77: 'Snow grains',
        80: 'Slight rain showers',
        81: 'Moderate rain showers',
        82: 'Violent rain showers',
        85: 'Slight snow showers',
        86: 'Heavy snow showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with slight hail',
        99: 'Thunderstorm with heavy hail',
    };
    return map[code] || 'Unknown';
}

export const fetchWeatherData = async (location: string, pastDays: number = 0) => {
    try {
        if (!location) throw new Error('No location provided');

        // 1) Geocode the location using Open-Meteo geocoding
        const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en`;
        let geoResp;
        try {
            geoResp = await axios.get(geocodeUrl);
        } catch (e) {
            // network error; try to proceed to fallback
            geoResp = null;
        }
        let geo = geoResp ? geoResp.data : null;
        let place = geo && geo.results && geo.results.length ? geo.results[0] : null;
        // fallback: try Nominatim if open-meteo didn't return a result
        if (!place) {
            try {
                const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`;
                const nom = await axios.get(nomUrl, { headers: { 'User-Agent': 'weather-monitor/1.0' } });
                if (nom && Array.isArray(nom.data) && nom.data.length > 0) {
                    const n = nom.data[0];
                    place = {
                        name: n.display_name || location,
                        latitude: Number(n.lat),
                        longitude: Number(n.lon),
                        admin1: n.state || n.county || '',
                        country: n.country || '',
                        boundingbox: n.boundingbox || null,
                    } as any;
                }
            } catch (e) {
                // ignore nominatim errors; we'll handle missing place below
            }
        }
        if (!place) {
            throw new Error(`Location not found: ${location} (geocode tried ${geocodeUrl} and Nominatim)`);
        }
        const lat = place.latitude;
        const lon = place.longitude;
        const placeName = [place.name, place.admin1, place.country].filter(Boolean).join(', ');

    // 2) Query Open-Meteo current weather and hourly humidity
    // if pastDays > 0, include past_days param to get historical data
    // include precipitation and wind direction for richer visuals
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,winddirection_10m,precipitation&timezone=auto${pastDays > 0 ? `&past_days=${pastDays}` : ''}`;
        const wresp = await axios.get(weatherUrl);
        const w = wresp.data;
        if (!w || !w.current_weather) {
            throw new Error('Weather data not available');
        }

        const current = w.current_weather;

        // find humidity from hourly if available
        let humidity: number | null = null;
        if (w.hourly && Array.isArray(w.hourly.time) && Array.isArray(w.hourly.relativehumidity_2m)) {
            // find index matching current time
            const idx = w.hourly.time.indexOf(current.time);
            if (idx !== -1) {
                humidity = w.hourly.relativehumidity_2m[idx];
            } else {
                // fallback: take the nearest by index 0
                humidity = w.hourly.relativehumidity_2m[0];
            }
        }

        // Map to WeatherData shape used by the app and include hourly arrays for charts
        // attempt to get a bounding box for the place. Open-Meteo geocoding may not include it; fallback to Nominatim
        let bbox: { south: number; north: number; west: number; east: number } | null = null;
        if (place && (place.boundingbox || place.bbox)) {
            const bb = (place.boundingbox || place.bbox) as any;
            // try common shapes: [south, north, west, east] or [lat1,lat2,long1,long2]
            if (Array.isArray(bb) && bb.length >= 4) {
                const south = Number(bb[0]);
                const north = Number(bb[1]);
                const west = Number(bb[2]);
                const east = Number(bb[3]);
                if (!Number.isNaN(south) && !Number.isNaN(north) && !Number.isNaN(west) && !Number.isNaN(east)) {
                    bbox = { south, north, west, east };
                }
            }
        }
        if (!bbox) {
            try {
                const nomUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(placeName)}`;
                const nom = await axios.get(nomUrl, { headers: { 'User-Agent': 'weather-monitor/1.0' } });
                const nomr = nom.data && nom.data[0];
                if (nomr && nomr.boundingbox) {
                    const bb = nomr.boundingbox; // [south, north, west, east] as strings
                    const south = Number(bb[0]);
                    const north = Number(bb[1]);
                    const west = Number(bb[2]);
                    const east = Number(bb[3]);
                    if ([south, north, west, east].every(v => !Number.isNaN(v))) {
                        bbox = { south, north, west, east };
                    }
                }
            } catch (e) {
                // ignore nominatim errors
            }
        }

        const result: any = {
            location: placeName,
            latitude: lat,
            longitude: lon,
            bbox,
            temperature: typeof current.temperature === 'number' ? current.temperature : Number(current.temperature),
            humidity: humidity ?? -1,
            conditions: weatherCodeToText(Number(current.weathercode)),
            // include raw hourly arrays so the UI can show charts
            hourly: w.hourly || null,
        };

        return result;
    } catch (error) {
        let msg = 'Unknown error fetching weather';
        if (error && typeof error === 'object' && 'message' in error) {
            // @ts-ignore
            msg = (error as any).message || msg;
        } else {
            msg = String(error) || msg;
        }
        console.error('fetchWeatherData failed:', msg);
        throw new Error('Error fetching weather data: ' + msg);
    }
};