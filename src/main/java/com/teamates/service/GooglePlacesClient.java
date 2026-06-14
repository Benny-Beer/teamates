package com.teamates.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.teamates.model.SportType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class GooglePlacesClient {

    @Value("${google.places.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    private static final Map<SportType, String> SPORT_KEYWORDS = Map.of(
            SportType.BASKETBALL, "basketball court",
            SportType.FOOTBALL, "football field",
            SportType.TENNIS, "tennis court",
            SportType.VOLLEYBALL, "volleyball court",
            SportType.SWIMMING, "swimming pool"
    );

    public List<GooglePlaceResult> searchNearby(double lat, double lng, double radiusMeters, SportType sportType) {
        try {
            String keyword = SPORT_KEYWORDS.get(sportType);

            String requestBody = """
                {
                  "textQuery": "%s",
                  "locationBias": {
                    "circle": {
                      "center": { "latitude": %f, "longitude": %f },
                      "radius": %f
                    }
                  },
                  "maxResultCount": 10
                }
                """.formatted(keyword, lat, lng, radiusMeters);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://places.googleapis.com/v1/places:searchText"))
                    .header("Content-Type", "application/json")
                    .header("X-Goog-Api-Key", apiKey)
                    .header("X-Goog-FieldMask", "places.id,places.displayName,places.formattedAddress,places.location")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            return parseResponse(response.body());

        } catch (Exception e) {
            return List.of(); // if Google fails, don't crash — just return nothing extra
        }
    }

    private List<GooglePlaceResult> parseResponse(String json) throws Exception {
        List<GooglePlaceResult> results = new ArrayList<>();
        JsonNode places = objectMapper.readTree(json).path("places");

        for (JsonNode place : places) {
            results.add(new GooglePlaceResult(
                    place.path("id").asText(),
                    place.path("displayName").path("text").asText(),
                    place.path("formattedAddress").asText(),
                    place.path("location").path("latitude").asDouble(),
                    place.path("location").path("longitude").asDouble()
            ));
        }

        return results;
    }
}