package com.canermastan.hotel.service;

import com.canermastan.hotel.entity.ConversationHistory;
import com.canermastan.hotel.entity.User;
import com.canermastan.hotel.repository.ConversationHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Transactional
public class ConversationHistoryService {
    
    private static final Logger logger = LoggerFactory.getLogger(ConversationHistoryService.class);
    
    @Autowired
    private ConversationHistoryRepository conversationHistoryRepository;
    
    public String generateSessionId() {
        return UUID.randomUUID().toString();
    }
    
    public ConversationHistory logUserMessage(String sessionId, String messageContent, User user) {
        logger.info("Logging user message for session: {}", sessionId);
        ConversationHistory conversation = new ConversationHistory(user, sessionId, 
            ConversationHistory.MessageType.USER_MESSAGE, messageContent);
        return conversationHistoryRepository.save(conversation);
    }
    
    public ConversationHistory logUserMessage(String sessionId, String messageContent) {
        logger.info("Logging anonymous user message for session: {}", sessionId);
        ConversationHistory conversation = new ConversationHistory(sessionId, 
            ConversationHistory.MessageType.USER_MESSAGE, messageContent);
        return conversationHistoryRepository.save(conversation);
    }
    
    public ConversationHistory logAiResponse(String sessionId, String messageContent, String aiResponse, 
                                           String intentDetected, Double confidenceScore, Long responseTimeMs) {
        List<ConversationHistory> sessionHistory = getConversationBySession(sessionId);
        ConversationHistory lastMessage = sessionHistory.isEmpty() ? null : sessionHistory.get(sessionHistory.size() - 1);
        
        ConversationHistory conversation;
        if (lastMessage != null && lastMessage.getMessageType() == ConversationHistory.MessageType.USER_MESSAGE) {
            // Update the last user message with AI response
            lastMessage.setAiResponse(aiResponse);
            lastMessage.setIntentDetected(intentDetected);
            lastMessage.setConfidenceScore(confidenceScore);
            lastMessage.setResponseTimeMs(responseTimeMs);
            conversation = conversationHistoryRepository.save(lastMessage);
        } else {
            // Create new AI response entry
            conversation = new ConversationHistory(sessionId, 
                ConversationHistory.MessageType.AI_RESPONSE, aiResponse);
            conversation.setIntentDetected(intentDetected);
            conversation.setConfidenceScore(confidenceScore);
            conversation.setResponseTimeMs(responseTimeMs);
            conversation = conversationHistoryRepository.save(conversation);
        }
        
        logger.info("Logged AI response for session: {} with intent: {}", sessionId, intentDetected);
        return conversation;
    }
    
    public ConversationHistory logSystemMessage(String sessionId, String messageContent, User user) {
        logger.info("Logging system message for session: {}", sessionId);
        ConversationHistory conversation = new ConversationHistory(user, sessionId, 
            ConversationHistory.MessageType.SYSTEM_MESSAGE, messageContent);
        return conversationHistoryRepository.save(conversation);
    }
    
    public ConversationHistory logErrorMessage(String sessionId, String messageContent, User user) {
        logger.warn("Logging error message for session: {}", sessionId);
        ConversationHistory conversation = new ConversationHistory(user, sessionId, 
            ConversationHistory.MessageType.ERROR_MESSAGE, messageContent);
        return conversationHistoryRepository.save(conversation);
    }
    
    public ConversationHistory updateContextData(Long conversationId, Map<String, Object> contextData) {
        ConversationHistory conversation = conversationHistoryRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
        
        conversation.setContextData(contextData);
        logger.info("Updated context data for conversation: {}", conversationId);
        return conversationHistoryRepository.save(conversation);
    }
    
    public ConversationHistory markAsResolved(Long conversationId) {
        ConversationHistory conversation = conversationHistoryRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
        
        conversation.setIsResolved(true);
        logger.info("Marked conversation as resolved: {}", conversationId);
        return conversationHistoryRepository.save(conversation);
    }
    
    public ConversationHistory addUserFeedback(Long conversationId, ConversationHistory.UserFeedback feedback) {
        ConversationHistory conversation = conversationHistoryRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));
        
        conversation.setUserFeedback(feedback);
        logger.info("Added user feedback {} for conversation: {}", feedback, conversationId);
        return conversationHistoryRepository.save(conversation);
    }
    
    public List<ConversationHistory> getConversationBySession(String sessionId) {
        return conversationHistoryRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);
    }
    
    public List<ConversationHistory> getConversationsByUser(Long userId) {
        return conversationHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<ConversationHistory> getConversationsByUser(User user) {
        return conversationHistoryRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    public List<ConversationHistory> getRecentConversationsByUser(Long userId, int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        return conversationHistoryRepository.findRecentConversationsByUser(userId, since);
    }
    
    public List<String> getUserSessionIds(Long userId) {
        return conversationHistoryRepository.findSessionIdsByUser(userId);
    }
    
    public List<ConversationHistory> getConversationsByMessageType(ConversationHistory.MessageType messageType) {
        return conversationHistoryRepository.findByMessageType(messageType);
    }
    
    public List<ConversationHistory> getConversationsByIntent(String intentDetected) {
        return conversationHistoryRepository.findByIntentDetected(intentDetected);
    }
    
    public List<ConversationHistory> getUnresolvedConversations() {
        return conversationHistoryRepository.findByIsResolved(false);
    }
    
    public List<ConversationHistory> getLowConfidenceMessages(double threshold) {
        return conversationHistoryRepository.findLowConfidenceMessages(threshold);
    }
    
    public List<ConversationHistory> getConversationsInPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        return conversationHistoryRepository.findByCreatedAtBetween(startDate, endDate);
    }
    
    public Double getAverageResponseTime(LocalDateTime startDate, LocalDateTime endDate) {
        return conversationHistoryRepository.getAverageResponseTime(startDate, endDate);
    }
    
    public List<Object[]> getIntentStatistics() {
        return conversationHistoryRepository.getIntentStatistics();
    }
    
    public Long getUnresolvedConversationCount() {
        return conversationHistoryRepository.countUnresolvedConversations();
    }
    
    public Long getPositiveFeedbackCount() {
        return conversationHistoryRepository.countPositiveFeedback();
    }
    
    public Long getNegativeFeedbackCount() {
        return conversationHistoryRepository.countNegativeFeedback();
    }
    
    public double getFeedbackRatio() {
        Long positive = getPositiveFeedbackCount();
        Long negative = getNegativeFeedbackCount();
        Long total = positive + negative;
        return total > 0 ? (double) positive / total : 0.0;
    }
    
    @Transactional
    public void cleanupOldConversations(int daysOld) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        conversationHistoryRepository.deleteOldConversations(cutoffDate);
        logger.info("Cleaned up conversations older than {} days", daysOld);
    }
    
    public ConversationHistory createCheckinRequest(String sessionId, String messageContent, User user) {
        logger.info("Creating check-in request for session: {}", sessionId);
        ConversationHistory conversation = new ConversationHistory(user, sessionId, 
            ConversationHistory.MessageType.CHECKIN_REQUEST, messageContent);
        return conversationHistoryRepository.save(conversation);
    }
    
    public ConversationHistory createRoomInquiry(String sessionId, String messageContent, User user) {
        logger.info("Creating room inquiry for session: {}", sessionId);
        ConversationHistory conversation = new ConversationHistory(user, sessionId, 
            ConversationHistory.MessageType.ROOM_INQUIRY, messageContent);
        return conversationHistoryRepository.save(conversation);
    }
    
    public ConversationHistory createBookingRequest(String sessionId, String messageContent, User user) {
        logger.info("Creating booking request for session: {}", sessionId);
        ConversationHistory conversation = new ConversationHistory(user, sessionId, 
            ConversationHistory.MessageType.BOOKING_REQUEST, messageContent);
        return conversationHistoryRepository.save(conversation);
    }
}
