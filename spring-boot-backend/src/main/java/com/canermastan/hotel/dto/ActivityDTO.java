package com.canermastan.hotel.dto;

import com.canermastan.hotel.entity.Activity;
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
public class ActivityDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer capacity;
    private Integer availableSlots;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Activity.ActivityStatus status;
    private Long hotelId;
    private String hotelName;
}