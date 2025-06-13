package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.User;
import com.canermastan.hotel.entity.UserPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {
    
    Optional<UserPreferences> findByUserId(Long userId);
    
    Optional<UserPreferences> findByUser(User user);
    
    List<UserPreferences> findByLanguage(String language);
    
    List<UserPreferences> findByTimezone(String timezone);
    
    List<UserPreferences> findByCurrency(String currency);
    
    @Query("SELECT up FROM UserPreferences up WHERE up.notificationEmail = true")
    List<UserPreferences> findUsersWithEmailNotificationsEnabled();
    
    @Query("SELECT up FROM UserPreferences up WHERE up.notificationSms = true")
    List<UserPreferences> findUsersWithSmsNotificationsEnabled();
    
    @Query("SELECT up FROM UserPreferences up WHERE up.marketingEmails = true")
    List<UserPreferences> findUsersWithMarketingEmailsEnabled();
    
    @Query("SELECT COUNT(up) FROM UserPreferences up WHERE up.language = :language")
    Long countByLanguage(@Param("language") String language);
    
    @Query("SELECT up.language, COUNT(up) FROM UserPreferences up GROUP BY up.language")
    List<Object[]> getLanguageStatistics();
    
    @Query("SELECT up.timezone, COUNT(up) FROM UserPreferences up GROUP BY up.timezone")
    List<Object[]> getTimezoneStatistics();
    
    @Query("SELECT up FROM UserPreferences up WHERE up.dietaryRequirements IS NOT NULL AND up.dietaryRequirements != ''")
    List<UserPreferences> findUsersWithDietaryRequirements();
    
    @Query("SELECT up FROM UserPreferences up WHERE up.specialRequests IS NOT NULL AND up.specialRequests != ''")
    List<UserPreferences> findUsersWithSpecialRequests();
}
