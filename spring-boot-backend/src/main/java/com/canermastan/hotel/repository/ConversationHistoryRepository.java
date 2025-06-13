package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.ConversationHistory;
import com.canermastan.hotel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConversationHistoryRepository extends JpaRepository<ConversationHistory, Long> {
    
    List<ConversationHistory> findBySessionIdOrderByCreatedAtAsc(String sessionId);
    
    List<ConversationHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<ConversationHistory> findByUserOrderByCreatedAtDesc(User user);
    
    List<ConversationHistory> findByMessageType(ConversationHistory.MessageType messageType);
    
    List<ConversationHistory> findByIntentDetected(String intentDetected);
    
    List<ConversationHistory> findByIsResolved(Boolean isResolved);
    
    List<ConversationHistory> findByUserFeedback(ConversationHistory.UserFeedback userFeedback);
    
    @Query("SELECT ch FROM ConversationHistory ch WHERE ch.sessionId = :sessionId AND ch.messageType = :messageType ORDER BY ch.createdAt ASC")
    List<ConversationHistory> findBySessionIdAndMessageType(@Param("sessionId") String sessionId, 
                                                           @Param("messageType") ConversationHistory.MessageType messageType);
    
    @Query("SELECT ch FROM ConversationHistory ch WHERE ch.createdAt BETWEEN :startDate AND :endDate ORDER BY ch.createdAt DESC")
    List<ConversationHistory> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                   @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT ch FROM ConversationHistory ch WHERE ch.confidenceScore < :threshold AND ch.confidenceScore IS NOT NULL")
    List<ConversationHistory> findLowConfidenceMessages(@Param("threshold") Double threshold);
    
    @Query("SELECT AVG(ch.responseTimeMs) FROM ConversationHistory ch WHERE ch.responseTimeMs IS NOT NULL AND ch.createdAt BETWEEN :startDate AND :endDate")
    Double getAverageResponseTime(@Param("startDate") LocalDateTime startDate, 
                                @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT ch.intentDetected, COUNT(ch) FROM ConversationHistory ch WHERE ch.intentDetected IS NOT NULL GROUP BY ch.intentDetected ORDER BY COUNT(ch) DESC")
    List<Object[]> getIntentStatistics();
    
    @Query("SELECT COUNT(ch) FROM ConversationHistory ch WHERE ch.isResolved = false")
    Long countUnresolvedConversations();
    
    @Query("SELECT COUNT(ch) FROM ConversationHistory ch WHERE ch.userFeedback = 'HELPFUL'")
    Long countPositiveFeedback();
    
    @Query("SELECT COUNT(ch) FROM ConversationHistory ch WHERE ch.userFeedback = 'NOT_HELPFUL'")
    Long countNegativeFeedback();
    
    @Query("SELECT ch FROM ConversationHistory ch WHERE ch.user.id = :userId AND ch.createdAt >= :since ORDER BY ch.createdAt DESC")
    List<ConversationHistory> findRecentConversationsByUser(@Param("userId") Long userId, 
                                                           @Param("since") LocalDateTime since);
    
    @Query("SELECT DISTINCT ch.sessionId FROM ConversationHistory ch WHERE ch.user.id = :userId ORDER BY MAX(ch.createdAt) DESC")
    List<String> findSessionIdsByUser(@Param("userId") Long userId);
    
    @Query("DELETE FROM ConversationHistory ch WHERE ch.createdAt < :cutoffDate")
    void deleteOldConversations(@Param("cutoffDate") LocalDateTime cutoffDate);
}
