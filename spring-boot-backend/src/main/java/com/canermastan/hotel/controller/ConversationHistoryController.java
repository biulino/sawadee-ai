package com.canermastan.hotel.controller;

import com.canermastan.hotel.entity.ConversationHistory;
import com.canermastan.hotel.service.ConversationHistoryService;
import com.canermastan.hotel.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversation-history")
@CrossOrigin(origins = "*")
public class ConversationHistoryController {
    
    private static final Logger logger = LoggerFactory.getLogger(ConversationHistoryController.class);
    
    @Autowired
    private ConversationHistoryService conversationHistoryService;
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/sessions")
    public ResponseEntity<?> createNewSession() {
        try {
            String sessionId = conversationHistoryService.generateSessionId();
            return ResponseEntity.ok(Map.of("sessionId", sessionId));
        } catch (Exception e) {
            logger.error("Error creating new session", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create new session"));
        }
    }
    
    @PostMapping("/log/user-message")
    public ResponseEntity<?> logUserMessage(@RequestBody Map<String, Object> request) {
        try {
            String sessionId = (String) request.get("sessionId");
            String messageContent = (String) request.get("messageContent");
            Long userId = request.containsKey("userId") ? ((Number) request.get("userId")).longValue() : null;
            
            if (sessionId == null || messageContent == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "sessionId and messageContent are required"));
            }
            
            ConversationHistory conversation;
            if (userId != null) {
                var user = userService.getUserById(userId);
                if (user.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
                }
                conversation = conversationHistoryService.logUserMessage(sessionId, messageContent, user.get());
            } else {
                conversation = conversationHistoryService.logUserMessage(sessionId, messageContent);
            }
            
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            logger.error("Error logging user message", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to log user message"));
        }
    }
    
    @PostMapping("/log/ai-response")
    public ResponseEntity<?> logAiResponse(@RequestBody Map<String, Object> request) {
        try {
            String sessionId = (String) request.get("sessionId");
            String messageContent = (String) request.get("messageContent");
            String aiResponse = (String) request.get("aiResponse");
            String intentDetected = (String) request.get("intentDetected");
            Double confidenceScore = request.containsKey("confidenceScore") ? 
                ((Number) request.get("confidenceScore")).doubleValue() : null;
            Long responseTimeMs = request.containsKey("responseTimeMs") ? 
                ((Number) request.get("responseTimeMs")).longValue() : null;
            
            if (sessionId == null || aiResponse == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "sessionId and aiResponse are required"));
            }
            
            ConversationHistory conversation = conversationHistoryService.logAiResponse(
                sessionId, messageContent, aiResponse, intentDetected, confidenceScore, responseTimeMs);
            
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            logger.error("Error logging AI response", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to log AI response"));
        }
    }
    
    @PostMapping("/log/system-message")
    public ResponseEntity<?> logSystemMessage(@RequestBody Map<String, Object> request) {
        try {
            String sessionId = (String) request.get("sessionId");
            String messageContent = (String) request.get("messageContent");
            Long userId = request.containsKey("userId") ? ((Number) request.get("userId")).longValue() : null;
            
            if (sessionId == null || messageContent == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "sessionId and messageContent are required"));
            }
            
            ConversationHistory conversation;
            if (userId != null) {
                var user = userService.getUserById(userId);
                if (user.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
                }
                conversation = conversationHistoryService.logSystemMessage(sessionId, messageContent, user.get());
            } else {
                conversation = conversationHistoryService.logSystemMessage(sessionId, messageContent, null);
            }
            
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            logger.error("Error logging system message", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to log system message"));
        }
    }
    
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<?> getConversationBySession(@PathVariable String sessionId) {
        try {
            List<ConversationHistory> conversation = conversationHistoryService.getConversationBySession(sessionId);
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            logger.error("Error retrieving conversation for session: {}", sessionId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve conversation"));
        }
    }
    
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getConversationsByUser(@PathVariable Long userId) {
        try {
            List<ConversationHistory> conversations = conversationHistoryService.getConversationsByUser(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            logger.error("Error retrieving conversations for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve conversations"));
        }
    }
    
    @GetMapping("/users/{userId}/sessions")
    public ResponseEntity<?> getUserSessionIds(@PathVariable Long userId) {
        try {
            List<String> sessionIds = conversationHistoryService.getUserSessionIds(userId);
            return ResponseEntity.ok(sessionIds);
        } catch (Exception e) {
            logger.error("Error retrieving session IDs for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve session IDs"));
        }
    }
    
    @GetMapping("/users/{userId}/recent")
    public ResponseEntity<?> getRecentConversationsByUser(@PathVariable Long userId, 
                                                        @RequestParam(defaultValue = "24") int hours) {
        try {
            List<ConversationHistory> conversations = conversationHistoryService.getRecentConversationsByUser(userId, hours);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            logger.error("Error retrieving recent conversations for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve recent conversations"));
        }
    }
    
    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> markAsResolved(@PathVariable Long id) {
        try {
            ConversationHistory updated = conversationHistoryService.markAsResolved(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Conversation not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error marking conversation as resolved: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to mark conversation as resolved"));
        }
    }
    
    @PutMapping("/{id}/feedback")
    public ResponseEntity<?> addUserFeedback(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String feedbackStr = request.get("feedback");
            if (feedbackStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "feedback is required"));
            }
            
            ConversationHistory.UserFeedback feedback = ConversationHistory.UserFeedback.valueOf(feedbackStr.toUpperCase());
            ConversationHistory updated = conversationHistoryService.addUserFeedback(id, feedback);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid feedback value"));
        } catch (RuntimeException e) {
            logger.warn("Conversation not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error adding user feedback: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to add user feedback"));
        }
    }
    
    @PutMapping("/{id}/context")
    public ResponseEntity<?> updateContextData(@PathVariable Long id, @RequestBody Map<String, Object> contextData) {
        try {
            ConversationHistory updated = conversationHistoryService.updateContextData(id, contextData);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Conversation not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating context data: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update context data"));
        }
    }
    
    @GetMapping("/unresolved")
    public ResponseEntity<?> getUnresolvedConversations() {
        try {
            List<ConversationHistory> conversations = conversationHistoryService.getUnresolvedConversations();
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            logger.error("Error retrieving unresolved conversations", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve unresolved conversations"));
        }
    }
    
    @GetMapping("/low-confidence")
    public ResponseEntity<?> getLowConfidenceMessages(@RequestParam(defaultValue = "0.5") double threshold) {
        try {
            List<ConversationHistory> conversations = conversationHistoryService.getLowConfidenceMessages(threshold);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            logger.error("Error retrieving low confidence messages", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve low confidence messages"));
        }
    }
    
    @GetMapping("/stats/intents")
    public ResponseEntity<?> getIntentStatistics() {
        try {
            List<Object[]> stats = conversationHistoryService.getIntentStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error retrieving intent statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve intent statistics"));
        }
    }
    
    @GetMapping("/stats/feedback")
    public ResponseEntity<?> getFeedbackStatistics() {
        try {
            Long positive = conversationHistoryService.getPositiveFeedbackCount();
            Long negative = conversationHistoryService.getNegativeFeedbackCount();
            double ratio = conversationHistoryService.getFeedbackRatio();
            
            Map<String, Object> stats = Map.of(
                "positive", positive,
                "negative", negative,
                "ratio", ratio
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error retrieving feedback statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve feedback statistics"));
        }
    }
    
    @GetMapping("/stats/response-time")
    public ResponseEntity<?> getAverageResponseTime(@RequestParam String startDate, @RequestParam String endDate) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime start = LocalDateTime.parse(startDate, formatter);
            LocalDateTime end = LocalDateTime.parse(endDate, formatter);
            
            Double averageTime = conversationHistoryService.getAverageResponseTime(start, end);
            return ResponseEntity.ok(Map.of("averageResponseTimeMs", averageTime != null ? averageTime : 0.0));
        } catch (Exception e) {
            logger.error("Error retrieving average response time", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve average response time"));
        }
    }
}
