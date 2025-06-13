package com.canermastan.hotel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_reservations")
@RequiredArgsConstructor
@Getter
@Setter
public class ActivityReservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String fullName;
    private String email;
    private String phone;
      private Integer numberOfParticipants = 1;
    private String specialRequests;
    
    private BigDecimal totalPrice;
    
    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    private String paymentMethod;
    private String paymentTransactionId;
    
    @Enumerated(EnumType.STRING)
    private ReservationStatus status = ReservationStatus.CREATED;
    
    @ManyToOne
    @JoinColumn(name = "hotel_reservation_id", referencedColumnName = "id")
    @JsonIgnore
    private Reservation hotelReservation;
    
    @ManyToOne
    @JoinColumn(name = "activity_id", referencedColumnName = "id")
    @JsonIgnore
    private Activity activity;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public enum ReservationStatus {
        CREATED, CONFIRMED, CHECKED_IN, COMPLETED, CANCELLED
    }
    
    public enum PaymentStatus {
        PENDING, PAID, REFUNDED, FAILED
    }
} 