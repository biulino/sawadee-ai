package com.canermastan.hotel.entity;

import com.canermastan.hotel.converter.JsonConverter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "user_preferences")
public class UserPreferences {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;
    
    @Column(name = "language", length = 10)
    private String language = "en";
    
    @Column(name = "timezone", length = 50)
    private String timezone = "UTC";
    
    @Column(name = "currency", length = 3)
    private String currency = "USD";
    
    @Column(name = "notification_email", nullable = false)
    private Boolean notificationEmail = true;
    
    @Column(name = "notification_sms", nullable = false)
    private Boolean notificationSms = false;
    
    @Column(name = "notification_push", nullable = false)
    private Boolean notificationPush = true;
    
    @Column(name = "marketing_emails", nullable = false)
    private Boolean marketingEmails = false;
    
    @Column(name = "theme")
    private String theme = "light";
    
    @Column(name = "accessibility_settings", columnDefinition = "jsonb")
    @Convert(converter = JsonConverter.class)
    private Map<String, Object> accessibilitySettings;
    
    @Column(name = "room_preferences", columnDefinition = "jsonb")
    @Convert(converter = JsonConverter.class)
    private Map<String, Object> roomPreferences;
    
    @Column(name = "dietary_requirements")
    private String dietaryRequirements;
    
    @Column(name = "special_requests")
    private String specialRequests;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public UserPreferences() {}
    
    public UserPreferences(User user) {
        this.user = user;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getLanguage() {
        return language;
    }
    
    public void setLanguage(String language) {
        this.language = language;
    }
    
    public String getTimezone() {
        return timezone;
    }
    
    public void setTimezone(String timezone) {
        this.timezone = timezone;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public Boolean getNotificationEmail() {
        return notificationEmail;
    }
    
    public void setNotificationEmail(Boolean notificationEmail) {
        this.notificationEmail = notificationEmail;
    }
    
    public Boolean getNotificationSms() {
        return notificationSms;
    }
    
    public void setNotificationSms(Boolean notificationSms) {
        this.notificationSms = notificationSms;
    }
    
    public Boolean getNotificationPush() {
        return notificationPush;
    }
    
    public void setNotificationPush(Boolean notificationPush) {
        this.notificationPush = notificationPush;
    }
    
    public Boolean getMarketingEmails() {
        return marketingEmails;
    }
    
    public void setMarketingEmails(Boolean marketingEmails) {
        this.marketingEmails = marketingEmails;
    }
    
    public String getTheme() {
        return theme;
    }
    
    public void setTheme(String theme) {
        this.theme = theme;
    }
    
    public Map<String, Object> getAccessibilitySettings() {
        return accessibilitySettings;
    }
    
    public void setAccessibilitySettings(Map<String, Object> accessibilitySettings) {
        this.accessibilitySettings = accessibilitySettings;
    }
    
    public Map<String, Object> getRoomPreferences() {
        return roomPreferences;
    }
    
    public void setRoomPreferences(Map<String, Object> roomPreferences) {
        this.roomPreferences = roomPreferences;
    }
    
    public String getDietaryRequirements() {
        return dietaryRequirements;
    }
    
    public void setDietaryRequirements(String dietaryRequirements) {
        this.dietaryRequirements = dietaryRequirements;
    }
    
    public String getSpecialRequests() {
        return specialRequests;
    }
    
    public void setSpecialRequests(String specialRequests) {
        this.specialRequests = specialRequests;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
