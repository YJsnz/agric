package com.example.ty.weather;

public record WeatherCurrentResponse(
        String source,
        double latitude,
        double longitude,
        String observedAt,
        double temperature,
        double humidity,
        double windSpeed,
        double radiation,
        int weatherCode
) {}
