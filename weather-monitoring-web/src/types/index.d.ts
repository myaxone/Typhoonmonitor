// This file exports TypeScript types and interfaces used throughout the application.

export interface WeatherData {
    temperature: number;
    humidity: number;
    conditions: string;
    location: string;
    hourly?: {
        time?: string[];
        temperature_2m?: number[];
        relativehumidity_2m?: number[];
        windspeed_10m?: number[];
    } | null;
}

export interface Location {
    city: string;
    country: string;
}