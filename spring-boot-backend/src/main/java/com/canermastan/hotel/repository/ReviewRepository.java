package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.Hotel;
import com.canermastan.hotel.entity.Review;
import com.canermastan.hotel.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    
    List<Review> findByHotelIdOrderByCreatedAtDesc(Long hotelId);
    
    List<Review> findByHotelOrderByCreatedAtDesc(Hotel hotel);
    
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Review> findByUserOrderByCreatedAtDesc(User user);
    
    List<Review> findByRating(Integer rating);
    
    List<Review> findByRatingGreaterThanEqual(Integer minRating);
    
    List<Review> findByIsVerified(Boolean isVerified);
    
    List<Review> findByIsPublished(Boolean isPublished);
    
    @Query("SELECT r FROM Review r WHERE r.hotel.id = :hotelId AND r.isPublished = true ORDER BY r.createdAt DESC")
    List<Review> findPublishedReviewsByHotel(@Param("hotelId") Long hotelId);
    
    @Query("SELECT r FROM Review r WHERE r.hotel.id = :hotelId AND r.isVerified = true ORDER BY r.createdAt DESC")
    List<Review> findVerifiedReviewsByHotel(@Param("hotelId") Long hotelId);
    
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId AND r.isPublished = true")
    Double getAverageRatingByHotel(@Param("hotelId") Long hotelId);
    
    @Query("SELECT COUNT(r) FROM Review r WHERE r.hotel.id = :hotelId AND r.isPublished = true")
    Long countPublishedReviewsByHotel(@Param("hotelId") Long hotelId);
    
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.hotel.id = :hotelId AND r.isPublished = true GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistributionByHotel(@Param("hotelId") Long hotelId);
    
    @Query("SELECT r FROM Review r WHERE r.hotel.id = :hotelId AND r.rating >= :minRating AND r.isPublished = true ORDER BY r.createdAt DESC")
    List<Review> findHighRatedReviewsByHotel(@Param("hotelId") Long hotelId, @Param("minRating") Integer minRating);
    
    @Query("SELECT r FROM Review r WHERE r.createdAt BETWEEN :startDate AND :endDate ORDER BY r.createdAt DESC")
    List<Review> findReviewsInPeriod(@Param("startDate") LocalDateTime startDate, 
                                   @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT r FROM Review r WHERE r.responseFromHotel IS NULL AND r.isPublished = true AND r.rating <= :maxRating")
    List<Review> findReviewsNeedingResponse(@Param("maxRating") Integer maxRating);
    
    @Query("SELECT AVG(r.cleanlinessRating) FROM Review r WHERE r.hotel.id = :hotelId AND r.cleanlinessRating IS NOT NULL")
    Double getAverageCleanlinessRating(@Param("hotelId") Long hotelId);
    
    @Query("SELECT AVG(r.serviceRating) FROM Review r WHERE r.hotel.id = :hotelId AND r.serviceRating IS NOT NULL")
    Double getAverageServiceRating(@Param("hotelId") Long hotelId);
    
    @Query("SELECT AVG(r.locationRating) FROM Review r WHERE r.hotel.id = :hotelId AND r.locationRating IS NOT NULL")
    Double getAverageLocationRating(@Param("hotelId") Long hotelId);
    
    @Query("SELECT AVG(r.valueRating) FROM Review r WHERE r.hotel.id = :hotelId AND r.valueRating IS NOT NULL")
    Double getAverageValueRating(@Param("hotelId") Long hotelId);
    
    @Query("SELECT AVG(r.amenitiesRating) FROM Review r WHERE r.hotel.id = :hotelId AND r.amenitiesRating IS NOT NULL")
    Double getAverageAmenitiesRating(@Param("hotelId") Long hotelId);
    
    @Query("SELECT r FROM Review r WHERE r.totalVotes >= :minVotes ORDER BY (CAST(r.helpfulVotes AS DOUBLE) / r.totalVotes) DESC")
    List<Review> findMostHelpfulReviews(@Param("minVotes") Integer minVotes);
    
    @Query("SELECT r FROM Review r WHERE r.user.id = :userId AND r.hotel.id = :hotelId")
    List<Review> findByUserAndHotel(@Param("userId") Long userId, @Param("hotelId") Long hotelId);
}
