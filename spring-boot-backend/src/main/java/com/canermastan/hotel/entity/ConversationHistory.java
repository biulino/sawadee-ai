package com.canermastan.hotel.entity;

import com.canermastan.hotel.converter.JsonConverter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "conversation_history")
public class ConversationHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
    
    @Column(name = "session_id", nullable = false)
    private String sessionId;
    
    @Column(name = "message_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private MessageType messageType;
    
    @Column(name = "message_content", nullable = false, columnDefinition = "TEXT")
    private String messageContent;
    
    @Column(name = "ai_response", columnDefinition = "TEXT")
    private String aiResponse;
    
    @Column(name = "context_data", columnDefinition = "jsonb")
    @Convert(converter = JsonConverter.class)
    private Map<String, Object> contextData;
    
    @Column(name = "intent_detected")
    private String intentDetected;
    
    @Column(name = "confidence_score")
    private Double confidenceScore;
    
    @Column(name = "is_resolved", nullable = false)
    private Boolean isResolved = false;
    
    @Column(name = "response_time_ms")
    private Long responseTimeMs;
    
    @Column(name = "user_feedback")
    @Enumerated(EnumType.STRING)
    private UserFeedback userFeedback;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Constructors
    public ConversationHistory() {}
    
    public ConversationHistory(String sessionId, MessageType messageType, String messageContent) {
        this.sessionId = sessionId;
        this.messageType = messageType;
        this.messageContent = messageContent;
    }
    
    public ConversationHistory(User user, String sessionId, MessageType messageType, String messageContent) {
        this.user = user;
        this.sessionId = sessionId;
        this.messageType = messageType;
        this.messageContent = messageContent;
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
    
    public String getSessionId() {
        return sessionId;
    }
    
    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }
    
    public MessageType getMessageType() {
        return messageType;
    }
    
    public void setMessageType(MessageType messageType) {
        this.messageType = messageType;
    }
    
    public String getMessageContent() {
        return messageContent;
    }
    
    public void setMessageContent(String messageContent) {
        this.messageContent = messageContent;
    }
    
    public String getAiResponse() {
        return aiResponse;
    }
    
    public void setAiResponse(String aiResponse) {
        this.aiResponse = aiResponse;
    }
    
    public Map<String, Object> getContextData() {
        return contextData;
    }
    
    public void setContextData(Map<String, Object> contextData) {
        this.contextData = contextData;
    }
    
    public String getIntentDetected() {
        return intentDetected;
    }
    
    public void setIntentDetected(String intentDetected) {
        this.intentDetected = intentDetected;
    }
    
    public Double getConfidenceScore() {
        return confidenceScore;
    }
    
    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }
    
    public Boolean getIsResolved() {
        return isResolved;
    }
    
    public void setIsResolved(Boolean isResolved) {
        this.isResolved = isResolved;
    }
    
    public Long getResponseTimeMs() {
        return responseTimeMs;
    }
    
    public void setResponseTimeMs(Long responseTimeMs) {
        this.responseTimeMs = responseTimeMs;
    }
    
    public UserFeedback getUserFeedback() {
        return userFeedback;
    }
    
    public void setUserFeedback(UserFeedback userFeedback) {
        this.userFeedback = userFeedback;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    // Enums
    public enum MessageType {
        USER_MESSAGE,
        AI_RESPONSE,
        SYSTEM_MESSAGE,
        ERROR_MESSAGE,
        CHECKIN_REQUEST,
        ROOM_INQUIRY,
        BOOKING_REQUEST,
        SUPPORT_REQUEST
    }
    
    public enum UserFeedback {
        HELPFUL,
        NOT_HELPFUL,
        PARTIALLY_HELPFUL,
        IRRELEVANT
    }
}
