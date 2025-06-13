package com.canermastan.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelInfoDTO {
    private Long id;
    private Long tenantId;
    private String name;
    private String address;
    private String phone;
    private String email;
    private String website;
    private String description;
    private Map<String, String> operatingHours;
    private List<String> amenities;
    private Map<String, String> policies;
    private Map<String, Object> location;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
