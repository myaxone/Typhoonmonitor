import React from 'react';
import { WeatherData } from '../types';

interface WeatherCardProps {
    data: WeatherData;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ data }) => {
    if (!data) return null;

    const { location, temperature, humidity, conditions } = data;

    return (
        <div className="weather-card">
            <h2>{location}</h2>
            <p>Temperature: {temperature}°C</p>
            <p>Humidity: {humidity}%</p>
            <p>Conditions: {conditions}</p>
        </div>
    );
};

export default WeatherCard;