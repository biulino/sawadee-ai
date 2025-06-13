package com.canermastan.hotel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    @JsonIgnore
    private Hotel hotel;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    @JsonIgnore
    private Reservation reservation;
    
    @Column(name = "rating", nullable = false)
    private Integer rating;
    
    @Column(name = "title")
    private String title;
    
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "cleanliness_rating")
    private Integer cleanlinessRating;
    
    @Column(name = "service_rating")
    private Integer serviceRating;
    
    @Column(name = "location_rating")
    private Integer locationRating;
    
    @Column(name = "value_rating")
    private Integer valueRating;
    
    @Column(name = "amenities_rating")
    private Integer amenitiesRating;
    
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;
    
    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = true;
    
    @Column(name = "helpful_votes", nullable = false)
    private Integer helpfulVotes = 0;
    
    @Column(name = "total_votes", nullable = false)
    private Integer totalVotes = 0;
    
    @Column(name = "response_from_hotel", columnDefinition = "TEXT")
    private String responseFromHotel;
    
    @Column(name = "response_date")
    private LocalDateTime responseDate;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
    
    // Constructors
    public Review() {}
    
    public Review(User user, Hotel hotel, Integer rating, String title, String comment) {
        this.user = user;
        this.hotel = hotel;
        this.rating = rating;
        this.title = title;
        this.comment = comment;
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
    
    public Hotel getHotel() {
        return hotel;
    }
    
    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
    }
    
    public Reservation getReservation() {
        return reservation;
    }
    
    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public Integer getCleanlinessRating() {
        return cleanlinessRating;
    }
    
    public void setCleanlinessRating(Integer cleanlinessRating) {
        this.cleanlinessRating = cleanlinessRating;
    }
    
    public Integer getServiceRating() {
        return serviceRating;
    }
    
    public void setServiceRating(Integer serviceRating) {
        this.serviceRating = serviceRating;
    }
    
    public Integer getLocationRating() {
        return locationRating;
    }
    
    public void setLocationRating(Integer locationRating) {
        this.locationRating = locationRating;
    }
    
    public Integer getValueRating() {
        return valueRating;
    }
    
    public void setValueRating(Integer valueRating) {
        this.valueRating = valueRating;
    }
    
    public Integer getAmenitiesRating() {
        return amenitiesRating;
    }
    
    public void setAmenitiesRating(Integer amenitiesRating) {
        this.amenitiesRating = amenitiesRating;
    }
    
    public Boolean getIsVerified() {
        return isVerified;
    }
    
    public void setIsVerified(Boolean isVerified) {
        this.isVerified = isVerified;
    }
    
    public Boolean getIsPublished() {
        return isPublished;
    }
    
    public void setIsPublished(Boolean isPublished) {
        this.isPublished = isPublished;
    }
    
    public Integer getHelpfulVotes() {
        return helpfulVotes;
    }
    
    public void setHelpfulVotes(Integer helpfulVotes) {
        this.helpfulVotes = helpfulVotes;
    }
    
    public Integer getTotalVotes() {
        return totalVotes;
    }
    
    public void setTotalVotes(Integer totalVotes) {
        this.totalVotes = totalVotes;
    }
    
    public String getResponseFromHotel() {
        return responseFromHotel;
    }
    
    public void setResponseFromHotel(String responseFromHotel) {
        this.responseFromHotel = responseFromHotel;
    }
    
    public LocalDateTime getResponseDate() {
        return responseDate;
    }
    
    public void setResponseDate(LocalDateTime responseDate) {
        this.responseDate = responseDate;
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
    
    // Helper methods
    public Double getAverageRating() {
        int count = 0;
        int total = rating;
        count++;
        
        if (cleanlinessRating != null) {
            total += cleanlinessRating;
            count++;
        }
        if (serviceRating != null) {
            total += serviceRating;
            count++;
        }
        if (locationRating != null) {
            total += locationRating;
            count++;
        }
        if (valueRating != null) {
            total += valueRating;
            count++;
        }
        if (amenitiesRating != null) {
            total += amenitiesRating;
            count++;
        }
        
        return count > 0 ? (double) total / count : 0.0;
    }
    
    public Double getHelpfulnessRatio() {
        return totalVotes > 0 ? (double) helpfulVotes / totalVotes : 0.0;
    }
}
