package com.canermastan.hotel.dto;

import com.canermastan.hotel.entity.ActivityReservation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityReservationDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Integer numberOfParticipants;
    private String specialRequests;
    private BigDecimal totalPrice;
    private ActivityReservation.PaymentStatus paymentStatus;
    private String paymentMethod;
    private ActivityReservation.ReservationStatus status;
    private Long activityId;
    private String activityName;
    private Long hotelReservationId;
    private LocalDateTime createdAt;
}