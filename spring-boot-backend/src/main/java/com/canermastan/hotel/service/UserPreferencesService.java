package com.canermastan.hotel.service;

import com.canermastan.hotel.entity.User;
import com.canermastan.hotel.entity.UserPreferences;
import com.canermastan.hotel.repository.UserPreferencesRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class UserPreferencesService {
    
    private static final Logger logger = LoggerFactory.getLogger(UserPreferencesService.class);
    
    @Autowired
    private UserPreferencesRepository userPreferencesRepository;
    
    public UserPreferences createDefaultPreferences(User user) {
        logger.info("Creating default preferences for user: {}", user.getId());
        UserPreferences preferences = new UserPreferences(user);
        return userPreferencesRepository.save(preferences);
    }
    
    public Optional<UserPreferences> getPreferencesByUserId(Long userId) {
        return userPreferencesRepository.findByUserId(userId);
    }
    
    public Optional<UserPreferences> getPreferencesByUser(User user) {
        return userPreferencesRepository.findByUser(user);
    }
    
    public UserPreferences getOrCreatePreferences(User user) {
        Optional<UserPreferences> existing = getPreferencesByUser(user);
        if (existing.isPresent()) {
            return existing.get();
        } else {
            return createDefaultPreferences(user);
        }
    }
    
    public UserPreferences updateLanguage(Long userId, String language) {
        Optional<UserPreferences> preferencesOpt = getPreferencesByUserId(userId);
        if (preferencesOpt.isPresent()) {
            UserPreferences preferences = preferencesOpt.get();
            preferences.setLanguage(language);
            preferences.setUpdatedAt(LocalDateTime.now());
            logger.info("Updated language to {} for user: {}", language, userId);
            return userPreferencesRepository.save(preferences);
        }
        throw new RuntimeException("User preferences not found for user: " + userId);
    }
    
    public UserPreferences updateTimezone(Long userId, String timezone) {
        Optional<UserPreferences> preferencesOpt = getPreferencesByUserId(userId);
        if (preferencesOpt.isPresent()) {
            UserPreferences preferences = preferencesOpt.get();
            preferences.setTimezone(timezone);
            preferences.setUpdatedAt(LocalDateTime.now());
            logger.info("Updated timezone to {} for user: {}", timezone, userId);
            return userPreferencesRepository.save(preferences);
        }
        throw new RuntimeException("User preferences not found for user: " + userId);
    }
    
    public UserPreferences updateCurrency(Long userId, String currency) {
        Optional<UserPreferences> preferencesOpt = getPreferencesByUserId(userId);
        if (preferencesOpt.isPresent()) {
            UserPreferences preferences = preferencesOpt.get();
            preferences.setCurrency(currency);
            preferences.setUpdatedAt(LocalDateTime.now());
            logger.info("Updated currency to {} for user: {}", currency, userId);
            return userPreferencesRepository.save(preferences);
        }
        throw new RuntimeException("User preferences not found for user: " + userId);
    }
    
    public UserPreferences updateNotificationSettings(Long userId, Boolean email, Boolean sms, Boolean push, Boolean marketing) {
        Optional<UserPreferences> preferencesOpt = getPreferencesByUserId(userId);
        if (preferencesOpt.isPresent()) {
            UserPreferences preferences = preferencesOpt.get();
            preferences.setNotificationEmail(email);
            preferences.setNotificationSms(sms);
            preferences.setNotificationPush(push);
            preferences.setMarketingEmails(marketing);
            preferences.setUpdatedAt(LocalDateTime.now());
            logger.info("Updated notification settings for user: {}", userId);
            return userPreferencesRepository.save(preferences);
        }
        throw new RuntimeException("User preferences not found for user: " + userId);
    }
    
    public UserPreferences updateTheme(Long userId, String theme) {
        Optional<UserPreferences> preferencesOpt = getPreferencesByUserId(userId);
        if (preferencesOpt.isPresent()) {
            UserPreferences preferences = preferencesOpt.get();
            preferences.setTheme(theme);
            preferences.setUpdatedAt(LocalDateTime.now());
            logger.info("Updated theme to {} for user: {}", theme, userId);
            return userPreferencesRepository.save(preferences);
        }
        throw new RuntimeException("User preferences not found for user: " + userId);
    }
    
    public UserPreferences updateAccessibilitySettings(Long userId, Map<String, Object> accessibilitySettings) {
        Optional<UserPreferences> preferencesOpt = getPreferencesByUserId(userId);
        if (preferencesOpt.isPresent()) {
            UserPreferences preferences = preferencesOpt.get();
            preferences.setAccessibilitySettings(accessibilitySettings);
            preferences.setUpdatedAt(LocalDateTime.now());
            logger.info("Updated accessibility settings for user: {}", userId);
            return userPreferencesRepository.save(preferences);
        }
        throw new RuntimeException("User preferences not found for user: " + userId);
    }
    
    public UserPreferences updateRoomPreferences(Long userId, Map<String, Object> roomPreferences) {
        Optional<UserPreferences> preferencesOpt = getPreferencesByUserId(userId);
        if (preferencesOpt.isPresent()) {
            UserPreferences preferences = preferencesOpt.get();
            preferences.setRoomPreferences(roomPreferences);
            preferences.setUpdatedAt(LocalDateTime.now());
            logger.info("Updated room preferences for user: {}", userId);
            return userPreferencesRepository.save(preferences);
        }
        throw new RuntimeException("User preferences not found for user: " + userId);
    }
    
    public UserPreferences updateDietaryRequirements(Long userId, String dietaryRequirements) {
        Optional<UserPreferences> preferencesOpt = getPreferencesByUserId(userId);
        if (preferencesOpt.isPresent()) {
            UserPreferences preferences = preferencesOpt.get();
            preferences.setDietaryRequirements(dietaryRequirements);
            preferences.setUpdatedAt(LocalDateTime.now());
            logger.info("Updated dietary requirements for user: {}", userId);
            return userPreferencesRepository.save(preferences);
        }
        throw new RuntimeException("User preferences not found for user: " + userId);
    }
    
    public UserPreferences updateSpecialRequests(Long userId, String specialRequests) {
        Optional<UserPreferences> preferencesOpt = getPreferencesByUserId(userId);
        if (preferencesOpt.isPresent()) {
            UserPreferences preferences = preferencesOpt.get();
            preferences.setSpecialRequests(specialRequests);
            preferences.setUpdatedAt(LocalDateTime.now());
            logger.info("Updated special requests for user: {}", userId);
            return userPreferencesRepository.save(preferences);
        }
        throw new RuntimeException("User preferences not found for user: " + userId);
    }
    
    public List<UserPreferences> getUsersByLanguage(String language) {
        return userPreferencesRepository.findByLanguage(language);
    }
    
    public List<UserPreferences> getUsersWithEmailNotifications() {
        return userPreferencesRepository.findUsersWithEmailNotificationsEnabled();
    }
    
    public List<UserPreferences> getUsersWithSmsNotifications() {
        return userPreferencesRepository.findUsersWithSmsNotificationsEnabled();
    }
    
    public List<UserPreferences> getUsersWithMarketingEmails() {
        return userPreferencesRepository.findUsersWithMarketingEmailsEnabled();
    }
    
    public List<Object[]> getLanguageStatistics() {
        return userPreferencesRepository.getLanguageStatistics();
    }
    
    public List<Object[]> getTimezoneStatistics() {
        return userPreferencesRepository.getTimezoneStatistics();
    }
    
    public List<UserPreferences> getUsersWithDietaryRequirements() {
        return userPreferencesRepository.findUsersWithDietaryRequirements();
    }
    
    public List<UserPreferences> getUsersWithSpecialRequests() {
        return userPreferencesRepository.findUsersWithSpecialRequests();
    }
}
