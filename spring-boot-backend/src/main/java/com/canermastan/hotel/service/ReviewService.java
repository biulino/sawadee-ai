package com.canermastan.hotel.service;

import com.canermastan.hotel.entity.Hotel;
import com.canermastan.hotel.entity.Review;
import com.canermastan.hotel.entity.User;
import com.canermastan.hotel.repository.ReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class ReviewService {
    
    private static final Logger logger = LoggerFactory.getLogger(ReviewService.class);
    
    @Autowired
    private ReviewRepository reviewRepository;
    
    public Review createReview(Review review) {
        logger.info("Creating new review for hotel: {}", review.getHotel().getId());
        validateReview(review);
        return reviewRepository.save(review);
    }
    
    public Review createReview(User user, Hotel hotel, Integer rating, String title, String comment) {
        Review review = new Review(user, hotel, rating, title, comment);
        return createReview(review);
    }
    
    public Optional<Review> getReviewById(Long id) {
        return reviewRepository.findById(id);
    }
    
    public List<Review> getReviewsByHotel(Long hotelId) {
        return reviewRepository.findPublishedReviewsByHotel(hotelId);
    }
    
    public List<Review> getAllReviewsByHotel(Long hotelId) {
        return reviewRepository.findByHotelIdOrderByCreatedAtDesc(hotelId);
    }
    
    public List<Review> getReviewsByUser(Long userId) {
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
    
    public List<Review> getVerifiedReviewsByHotel(Long hotelId) {
        return reviewRepository.findVerifiedReviewsByHotel(hotelId);
    }
    
    public List<Review> getHighRatedReviewsByHotel(Long hotelId, Integer minRating) {
        return reviewRepository.findHighRatedReviewsByHotel(hotelId, minRating);
    }
    
    public Double getAverageRatingByHotel(Long hotelId) {
        Double average = reviewRepository.getAverageRatingByHotel(hotelId);
        return average != null ? average : 0.0;
    }
    
    public Long getReviewCountByHotel(Long hotelId) {
        return reviewRepository.countPublishedReviewsByHotel(hotelId);
    }
    
    public List<Object[]> getRatingDistribution(Long hotelId) {
        return reviewRepository.getRatingDistributionByHotel(hotelId);
    }
    
    public Map<String, Double> getDetailedRatings(Long hotelId) {
        Map<String, Double> ratings = new HashMap<>();
        ratings.put("overall", getAverageRatingByHotel(hotelId));
        ratings.put("cleanliness", reviewRepository.getAverageCleanlinessRating(hotelId));
        ratings.put("service", reviewRepository.getAverageServiceRating(hotelId));
        ratings.put("location", reviewRepository.getAverageLocationRating(hotelId));
        ratings.put("value", reviewRepository.getAverageValueRating(hotelId));
        ratings.put("amenities", reviewRepository.getAverageAmenitiesRating(hotelId));
        
        // Replace null values with 0.0
        ratings.replaceAll((k, v) -> v != null ? v : 0.0);
        
        return ratings;
    }
    
    public Review updateReview(Long reviewId, String title, String comment, Integer rating) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            review.setTitle(title);
            review.setComment(comment);
            review.setRating(rating);
            review.setUpdatedAt(LocalDateTime.now());
            
            validateReview(review);
            logger.info("Updated review: {}", reviewId);
            return reviewRepository.save(review);
        }
        throw new RuntimeException("Review not found with id: " + reviewId);
    }
    
    public Review updateDetailedRatings(Long reviewId, Integer cleanliness, Integer service, 
                                      Integer location, Integer value, Integer amenities) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            review.setCleanlinessRating(cleanliness);
            review.setServiceRating(service);
            review.setLocationRating(location);
            review.setValueRating(value);
            review.setAmenitiesRating(amenities);
            review.setUpdatedAt(LocalDateTime.now());
            
            validateDetailedRatings(review);
            logger.info("Updated detailed ratings for review: {}", reviewId);
            return reviewRepository.save(review);
        }
        throw new RuntimeException("Review not found with id: " + reviewId);
    }
    
    public Review verifyReview(Long reviewId) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            review.setIsVerified(true);
            review.setUpdatedAt(LocalDateTime.now());
            
            logger.info("Verified review: {}", reviewId);
            return reviewRepository.save(review);
        }
        throw new RuntimeException("Review not found with id: " + reviewId);
    }
    
    public Review publishReview(Long reviewId) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            review.setIsPublished(true);
            review.setUpdatedAt(LocalDateTime.now());
            
            logger.info("Published review: {}", reviewId);
            return reviewRepository.save(review);
        }
        throw new RuntimeException("Review not found with id: " + reviewId);
    }
    
    public Review unpublishReview(Long reviewId) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            review.setIsPublished(false);
            review.setUpdatedAt(LocalDateTime.now());
            
            logger.info("Unpublished review: {}", reviewId);
            return reviewRepository.save(review);
        }
        throw new RuntimeException("Review not found with id: " + reviewId);
    }
    
    public Review addHotelResponse(Long reviewId, String response) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            review.setResponseFromHotel(response);
            review.setResponseDate(LocalDateTime.now());
            review.setUpdatedAt(LocalDateTime.now());
            
            logger.info("Added hotel response to review: {}", reviewId);
            return reviewRepository.save(review);
        }
        throw new RuntimeException("Review not found with id: " + reviewId);
    }
    
    public Review voteHelpful(Long reviewId) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            review.setHelpfulVotes(review.getHelpfulVotes() + 1);
            review.setTotalVotes(review.getTotalVotes() + 1);
            review.setUpdatedAt(LocalDateTime.now());
            
            logger.info("Added helpful vote to review: {}", reviewId);
            return reviewRepository.save(review);
        }
        throw new RuntimeException("Review not found with id: " + reviewId);
    }
    
    public Review voteNotHelpful(Long reviewId) {
        Optional<Review> reviewOpt = reviewRepository.findById(reviewId);
        if (reviewOpt.isPresent()) {
            Review review = reviewOpt.get();
            review.setTotalVotes(review.getTotalVotes() + 1);
            review.setUpdatedAt(LocalDateTime.now());
            
            logger.info("Added not helpful vote to review: {}", reviewId);
            return reviewRepository.save(review);
        }
        throw new RuntimeException("Review not found with id: " + reviewId);
    }
    
    public List<Review> getMostHelpfulReviews(Integer minVotes) {
        return reviewRepository.findMostHelpfulReviews(minVotes);
    }
    
    public List<Review> getReviewsNeedingResponse(Integer maxRating) {
        return reviewRepository.findReviewsNeedingResponse(maxRating);
    }
    
    public List<Review> getReviewsInPeriod(LocalDateTime startDate, LocalDateTime endDate) {
        return reviewRepository.findReviewsInPeriod(startDate, endDate);
    }
    
    public List<Review> getUserReviewsForHotel(Long userId, Long hotelId) {
        return reviewRepository.findByUserAndHotel(userId, hotelId);
    }
    
    public boolean hasUserReviewedHotel(Long userId, Long hotelId) {
        List<Review> reviews = getUserReviewsForHotel(userId, hotelId);
        return !reviews.isEmpty();
    }
    
    private void validateReview(Review review) {
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }
        
        if (review.getTitle() != null && review.getTitle().length() > 255) {
            throw new IllegalArgumentException("Title must be 255 characters or less");
        }
        
        if (review.getComment() != null && review.getComment().length() > 5000) {
            throw new IllegalArgumentException("Comment must be 5000 characters or less");
        }
    }
    
    private void validateDetailedRatings(Review review) {
        validateRating("Cleanliness", review.getCleanlinessRating());
        validateRating("Service", review.getServiceRating());
        validateRating("Location", review.getLocationRating());
        validateRating("Value", review.getValueRating());
        validateRating("Amenities", review.getAmenitiesRating());
    }
    
    private void validateRating(String ratingType, Integer rating) {
        if (rating != null && (rating < 1 || rating > 5)) {
            throw new IllegalArgumentException(ratingType + " rating must be between 1 and 5");
        }
    }
}
