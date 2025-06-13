package com.canermastan.hotel.controller;

import com.canermastan.hotel.entity.UserPreferences;
import com.canermastan.hotel.service.UserPreferencesService;
import com.canermastan.hotel.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user-preferences")
@CrossOrigin(origins = "*")
public class UserPreferencesController {
    
    private static final Logger logger = LoggerFactory.getLogger(UserPreferencesController.class);
    
    @Autowired
    private UserPreferencesService userPreferencesService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPreferences(@PathVariable Long userId) {
        try {
            Optional<UserPreferences> preferences = userPreferencesService.getPreferencesByUserId(userId);
            if (preferences.isPresent()) {
                return ResponseEntity.ok(preferences.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving preferences for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve user preferences"));
        }
    }
    
    @PostMapping("/user/{userId}")
    public ResponseEntity<?> createOrGetUserPreferences(@PathVariable Long userId) {
        try {
            var user = userService.getUserById(userId);
            if (user.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            UserPreferences preferences = userPreferencesService.getOrCreatePreferences(user.get());
            logger.info("Created/retrieved preferences for user: {}", userId);
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            logger.error("Error creating/retrieving preferences for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create/retrieve user preferences"));
        }
    }
    
    @PutMapping("/user/{userId}/language")
    public ResponseEntity<?> updateLanguage(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String language = request.get("language");
            if (language == null || language.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Language is required"));
            }
            
            UserPreferences updated = userPreferencesService.updateLanguage(userId, language);
            logger.info("Updated language for user: {}", userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Failed to update language for user {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating language for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update language"));
        }
    }
    
    @PutMapping("/user/{userId}/timezone")
    public ResponseEntity<?> updateTimezone(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String timezone = request.get("timezone");
            if (timezone == null || timezone.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Timezone is required"));
            }
            
            UserPreferences updated = userPreferencesService.updateTimezone(userId, timezone);
            logger.info("Updated timezone for user: {}", userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Failed to update timezone for user {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating timezone for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update timezone"));
        }
    }
    
    @PutMapping("/user/{userId}/currency")
    public ResponseEntity<?> updateCurrency(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String currency = request.get("currency");
            if (currency == null || currency.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Currency is required"));
            }
            
            UserPreferences updated = userPreferencesService.updateCurrency(userId, currency);
            logger.info("Updated currency for user: {}", userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Failed to update currency for user {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating currency for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update currency"));
        }
    }
    
    @PutMapping("/user/{userId}/notifications")
    public ResponseEntity<?> updateNotificationSettings(@PathVariable Long userId, @RequestBody Map<String, Boolean> settings) {
        try {
            Boolean email = settings.get("email");
            Boolean sms = settings.get("sms");
            Boolean push = settings.get("push");
            Boolean marketing = settings.get("marketing");
            
            UserPreferences updated = userPreferencesService.updateNotificationSettings(userId, email, sms, push, marketing);
            logger.info("Updated notification settings for user: {}", userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Failed to update notification settings for user {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating notification settings for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update notification settings"));
        }
    }
    
    @PutMapping("/user/{userId}/theme")
    public ResponseEntity<?> updateTheme(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String theme = request.get("theme");
            if (theme == null || theme.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Theme is required"));
            }
            
            UserPreferences updated = userPreferencesService.updateTheme(userId, theme);
            logger.info("Updated theme for user: {}", userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Failed to update theme for user {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating theme for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update theme"));
        }
    }
    
    @PutMapping("/user/{userId}/accessibility")
    public ResponseEntity<?> updateAccessibilitySettings(@PathVariable Long userId, @RequestBody Map<String, Object> settings) {
        try {
            UserPreferences updated = userPreferencesService.updateAccessibilitySettings(userId, settings);
            logger.info("Updated accessibility settings for user: {}", userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Failed to update accessibility settings for user {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating accessibility settings for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update accessibility settings"));
        }
    }
    
    @PutMapping("/user/{userId}/room-preferences")
    public ResponseEntity<?> updateRoomPreferences(@PathVariable Long userId, @RequestBody Map<String, Object> preferences) {
        try {
            UserPreferences updated = userPreferencesService.updateRoomPreferences(userId, preferences);
            logger.info("Updated room preferences for user: {}", userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Failed to update room preferences for user {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating room preferences for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update room preferences"));
        }
    }
    
    @PutMapping("/user/{userId}/dietary")
    public ResponseEntity<?> updateDietaryRequirements(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String dietaryRequirements = request.get("dietaryRequirements");
            
            UserPreferences updated = userPreferencesService.updateDietaryRequirements(userId, dietaryRequirements);
            logger.info("Updated dietary requirements for user: {}", userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Failed to update dietary requirements for user {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating dietary requirements for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update dietary requirements"));
        }
    }
    
    @PutMapping("/user/{userId}/special-requests")
    public ResponseEntity<?> updateSpecialRequests(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        try {
            String specialRequests = request.get("specialRequests");
            
            UserPreferences updated = userPreferencesService.updateSpecialRequests(userId, specialRequests);
            logger.info("Updated special requests for user: {}", userId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Failed to update special requests for user {}: {}", userId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating special requests for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update special requests"));
        }
    }
    
    @GetMapping("/stats/languages")
    public ResponseEntity<?> getLanguageStatistics() {
        try {
            List<Object[]> stats = userPreferencesService.getLanguageStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error retrieving language statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve language statistics"));
        }
    }
    
    @GetMapping("/stats/timezones")
    public ResponseEntity<?> getTimezoneStatistics() {
        try {
            List<Object[]> stats = userPreferencesService.getTimezoneStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error retrieving timezone statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve timezone statistics"));
        }
    }
    
    @GetMapping("/marketing-enabled")
    public ResponseEntity<?> getUsersWithMarketingEmails() {
        try {
            List<UserPreferences> users = userPreferencesService.getUsersWithMarketingEmails();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            logger.error("Error retrieving users with marketing emails enabled", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve marketing email users"));
        }
    }
}
