package com.example.ty.weather;

import com.example.ty.auth.exception.BizException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class WeatherService {
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    @Value("${weather.latitude:39.9042}") private double latitude;
    @Value("${weather.longitude:116.4074}") private double longitude;

    public WeatherCurrentResponse current() {
        String url = "https://api.open-meteo.com/v1/forecast?latitude=" + latitude
                + "&longitude=" + longitude
                + "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,shortwave_radiation,weather_code"
                + "&wind_speed_unit=ms&timezone=auto";
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(url)).timeout(Duration.ofSeconds(8)).GET().build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) throw new IllegalStateException("HTTP " + response.statusCode());
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode current = root.path("current");
            return new WeatherCurrentResponse("Open-Meteo", root.path("latitude").asDouble(latitude),
                    root.path("longitude").asDouble(longitude), current.path("time").asText(),
                    current.path("temperature_2m").asDouble(), current.path("relative_humidity_2m").asDouble(),
                    current.path("wind_speed_10m").asDouble(), current.path("shortwave_radiation").asDouble(),
                    current.path("weather_code").asInt());
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            throw new BizException("WEATHER_UNAVAILABLE", "实时天气服务暂时不可用", 503);
        } catch (Exception error) {
            throw new BizException("WEATHER_UNAVAILABLE", "实时天气服务暂时不可用", 503);
        }
    }
}
