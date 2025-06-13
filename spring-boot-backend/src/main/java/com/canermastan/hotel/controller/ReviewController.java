package com.canermastan.hotel.controller;

import com.canermastan.hotel.entity.Review;
import com.canermastan.hotel.service.HotelService;
import com.canermastan.hotel.service.ReviewService;
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
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*")
public class ReviewController {
    
    private static final Logger logger = LoggerFactory.getLogger(ReviewController.class);
    
    @Autowired
    private ReviewService reviewService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private HotelService hotelService;
    
    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody Map<String, Object> request) {
        try {
            Long userId = ((Number) request.get("userId")).longValue();
            Long hotelId = ((Number) request.get("hotelId")).longValue();
            Integer rating = ((Number) request.get("rating")).intValue();
            String title = (String) request.get("title");
            String comment = (String) request.get("comment");
            
            var user = userService.getUserById(userId);
            var hotel = hotelService.getHotelById(hotelId);
            
            if (user.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "User not found"));
            }
            if (hotel.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Hotel not found"));
            }
            
            Review review = reviewService.createReview(user.get(), hotel.get(), rating, title, comment);
            logger.info("Created new review: {}", review.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to create review: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            logger.error("Error creating review", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create review"));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getReviewById(@PathVariable Long id) {
        try {
            Optional<Review> review = reviewService.getReviewById(id);
            if (review.isPresent()) {
                return ResponseEntity.ok(review.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving review: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve review"));
        }
    }
    
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<?> getReviewsByHotel(@PathVariable Long hotelId) {
        try {
            List<Review> reviews = reviewService.getReviewsByHotel(hotelId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("Error retrieving reviews for hotel: {}", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve hotel reviews"));
        }
    }
    
    @GetMapping("/hotel/{hotelId}/all")
    public ResponseEntity<?> getAllReviewsByHotel(@PathVariable Long hotelId) {
        try {
            List<Review> reviews = reviewService.getAllReviewsByHotel(hotelId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("Error retrieving all reviews for hotel: {}", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve all hotel reviews"));
        }
    }
    
    @GetMapping("/hotel/{hotelId}/verified")
    public ResponseEntity<?> getVerifiedReviewsByHotel(@PathVariable Long hotelId) {
        try {
            List<Review> reviews = reviewService.getVerifiedReviewsByHotel(hotelId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("Error retrieving verified reviews for hotel: {}", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve verified hotel reviews"));
        }
    }
    
    @GetMapping("/hotel/{hotelId}/high-rated")
    public ResponseEntity<?> getHighRatedReviewsByHotel(@PathVariable Long hotelId, 
                                                       @RequestParam(defaultValue = "4") Integer minRating) {
        try {
            List<Review> reviews = reviewService.getHighRatedReviewsByHotel(hotelId, minRating);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("Error retrieving high-rated reviews for hotel: {}", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve high-rated hotel reviews"));
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReviewsByUser(@PathVariable Long userId) {
        try {
            List<Review> reviews = reviewService.getReviewsByUser(userId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("Error retrieving reviews for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve user reviews"));
        }
    }
    
    @GetMapping("/hotel/{hotelId}/stats")
    public ResponseEntity<?> getHotelReviewStats(@PathVariable Long hotelId) {
        try {
            Double averageRating = reviewService.getAverageRatingByHotel(hotelId);
            Long reviewCount = reviewService.getReviewCountByHotel(hotelId);
            List<Object[]> ratingDistribution = reviewService.getRatingDistribution(hotelId);
            Map<String, Double> detailedRatings = reviewService.getDetailedRatings(hotelId);
            
            Map<String, Object> stats = Map.of(
                "averageRating", averageRating,
                "reviewCount", reviewCount,
                "ratingDistribution", ratingDistribution,
                "detailedRatings", detailedRatings
            );
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            logger.error("Error retrieving review stats for hotel: {}", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve hotel review stats"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(@PathVariable Long id, @RequestBody Map<String, Object> request) {
        try {
            String title = (String) request.get("title");
            String comment = (String) request.get("comment");
            Integer rating = ((Number) request.get("rating")).intValue();
            
            Review updated = reviewService.updateReview(id, title, comment, rating);
            logger.info("Updated review: {}", id);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to update review {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            logger.warn("Review not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating review: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update review"));
        }
    }
    
    @PutMapping("/{id}/detailed-ratings")
    public ResponseEntity<?> updateDetailedRatings(@PathVariable Long id, @RequestBody Map<String, Integer> ratings) {
        try {
            Review updated = reviewService.updateDetailedRatings(id, 
                ratings.get("cleanliness"),
                ratings.get("service"),
                ratings.get("location"),
                ratings.get("value"),
                ratings.get("amenities"));
            logger.info("Updated detailed ratings for review: {}", id);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            logger.warn("Failed to update detailed ratings for review {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            logger.warn("Review not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating detailed ratings for review: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update detailed ratings"));
        }
    }
    
    @PutMapping("/{id}/verify")
    public ResponseEntity<?> verifyReview(@PathVariable Long id) {
        try {
            Review verified = reviewService.verifyReview(id);
            logger.info("Verified review: {}", id);
            return ResponseEntity.ok(verified);
        } catch (RuntimeException e) {
            logger.warn("Review not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error verifying review: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to verify review"));
        }
    }
    
    @PutMapping("/{id}/publish")
    public ResponseEntity<?> publishReview(@PathVariable Long id) {
        try {
            Review published = reviewService.publishReview(id);
            logger.info("Published review: {}", id);
            return ResponseEntity.ok(published);
        } catch (RuntimeException e) {
            logger.warn("Review not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error publishing review: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to publish review"));
        }
    }
    
    @PutMapping("/{id}/unpublish")
    public ResponseEntity<?> unpublishReview(@PathVariable Long id) {
        try {
            Review unpublished = reviewService.unpublishReview(id);
            logger.info("Unpublished review: {}", id);
            return ResponseEntity.ok(unpublished);
        } catch (RuntimeException e) {
            logger.warn("Review not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error unpublishing review: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to unpublish review"));
        }
    }
    
    @PutMapping("/{id}/hotel-response")
    public ResponseEntity<?> addHotelResponse(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String response = request.get("response");
            if (response == null || response.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Response is required"));
            }
            
            Review updated = reviewService.addHotelResponse(id, response);
            logger.info("Added hotel response to review: {}", id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Review not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error adding hotel response to review: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to add hotel response"));
        }
    }
    
    @PutMapping("/{id}/vote/helpful")
    public ResponseEntity<?> voteHelpful(@PathVariable Long id) {
        try {
            Review updated = reviewService.voteHelpful(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Review not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error voting helpful for review: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to vote helpful"));
        }
    }
    
    @PutMapping("/{id}/vote/not-helpful")
    public ResponseEntity<?> voteNotHelpful(@PathVariable Long id) {
        try {
            Review updated = reviewService.voteNotHelpful(id);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            logger.warn("Review not found: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error voting not helpful for review: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to vote not helpful"));
        }
    }
    
    @GetMapping("/most-helpful")
    public ResponseEntity<?> getMostHelpfulReviews(@RequestParam(defaultValue = "5") Integer minVotes) {
        try {
            List<Review> reviews = reviewService.getMostHelpfulReviews(minVotes);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("Error retrieving most helpful reviews", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve most helpful reviews"));
        }
    }
    
    @GetMapping("/needing-response")
    public ResponseEntity<?> getReviewsNeedingResponse(@RequestParam(defaultValue = "3") Integer maxRating) {
        try {
            List<Review> reviews = reviewService.getReviewsNeedingResponse(maxRating);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("Error retrieving reviews needing response", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve reviews needing response"));
        }
    }
    
    @GetMapping("/period")
    public ResponseEntity<?> getReviewsInPeriod(@RequestParam String startDate, @RequestParam String endDate) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
            LocalDateTime start = LocalDateTime.parse(startDate, formatter);
            LocalDateTime end = LocalDateTime.parse(endDate, formatter);
            
            List<Review> reviews = reviewService.getReviewsInPeriod(start, end);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            logger.error("Error retrieving reviews in period", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve reviews in period"));
        }
    }
    
    @GetMapping("/user/{userId}/hotel/{hotelId}/exists")
    public ResponseEntity<?> checkUserReviewExists(@PathVariable Long userId, @PathVariable Long hotelId) {
        try {
            boolean exists = reviewService.hasUserReviewedHotel(userId, hotelId);
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (Exception e) {
            logger.error("Error checking if user reviewed hotel", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to check review existence"));
        }
    }
}
