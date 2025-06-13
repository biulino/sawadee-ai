package com.canermastan.hotel.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RecommendationController {

    @Qualifier("timeoutRestTemplate")
    private final RestTemplate restTemplate;
    private final String AI_SERVICE_URL = "http://localhost:5051";

    @PostMapping("/activities")
    public ResponseEntity<?> getActivityRecommendations(
            @RequestParam Integer userId,
            @RequestParam(defaultValue = "1") Integer hotelId,
            @RequestParam(defaultValue = "5") Integer topN) {
        
        try {
            // Prepare request to AI service
            Map<String, Object> request = new HashMap<>();
            request.put("user_id", userId);
            request.put("hotel_id", hotelId);
            request.put("top_n", topN);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

            // Call AI recommendation service
            ResponseEntity<Object> response = restTemplate.postForEntity(
                AI_SERVICE_URL + "/api/recommendations/activities",
                entity,
                Object.class
            );

            return ResponseEntity.ok(response.getBody());
            
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get activity recommendations: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/categories")
    public ResponseEntity<?> getActivityCategories() {
        try {
            ResponseEntity<Object> response = restTemplate.getForEntity(
                AI_SERVICE_URL + "/api/activities/categories",
                Object.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get activity categories: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testEndpoint() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "working");
        response.put("message", "Recommendation controller is active");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<?> getRecommendationServiceHealth() {
        try {
            ResponseEntity<Object> response = restTemplate.getForEntity(
                AI_SERVICE_URL + "/health",
                Object.class
            );
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "AI recommendation service is not available");
            error.put("status", "unhealthy");
            return ResponseEntity.status(503).body(error);
        }
    }
}
