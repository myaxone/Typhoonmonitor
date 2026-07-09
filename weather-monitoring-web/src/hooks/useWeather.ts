import { useState } from 'react';
import { fetchWeatherData } from '../services/weatherApi';
import { WeatherData } from '../types';

const useWeather = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWeather = async (location: string, pastDays: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchWeatherData(location, pastDays);
            // return data to caller so they can use it (for comparison requests)
            if (pastDays === 0) setWeatherData(data);
            return data;
        } catch (err) {
            // try to extract a useful message from the thrown error
            let msg = 'Failed to fetch weather data';
            if (err && typeof err === 'object' && 'message' in err) {
                // @ts-ignore
                msg = (err as any).message || msg;
            } else {
                msg = String(err) || msg;
            }
            setError(msg);
            setWeatherData(null);
        } finally {
            setLoading(false);
        }
    }

    return { weatherData, loading, error, fetchWeather };
};

export { useWeather };
export default useWeather;