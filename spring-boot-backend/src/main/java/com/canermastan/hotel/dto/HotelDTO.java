package com.canermastan.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelDTO {
    private Long id;
    private String name;
    private String city;
    private String address;
    private String description;
    private Double pricePerNight;
    private Integer totalRooms;
    private Integer availableRooms;
} 