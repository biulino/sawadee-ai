package com.canermastan.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    
    private Integer numberOfGuests;
    private String specialRequests;
    
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer numberOfRooms;
    
    private Double totalPrice;
    private String paymentStatus;
    private String paymentMethod;
    private String paymentTransactionId;
    
    private String status;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Hotel ve Room için sadece gerekli bilgiler
    private Long hotelId;
    private String hotelName;
    
    private Long roomId;
    private String roomNumber;
} 