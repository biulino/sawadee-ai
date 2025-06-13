package com.canermastan.hotel.request;

import lombok.Data;

@Data
public class ActivityReservationRequest {
    private String fullName;
    private String email;
    private String phone;
    private Integer numberOfParticipants = 1;
    private String specialRequests;
    private String paymentMethod;
    private Long activityId;
    private Long hotelReservationId; // İlişkili otel rezervasyonu (opsiyonel)
} 