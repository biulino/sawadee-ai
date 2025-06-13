package com.canermastan.hotel.request;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import java.util.List;
import java.util.Map;

@Data
public class HotelInfoRequest {
    
    @NotBlank(message = "Hotel name is required")
    private String name;
    
    @NotBlank(message = "Address is required")
    private String address;
    
    @NotBlank(message = "Phone number is required")
    private String phone;
    
    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;
    
    private String website;
    private String description;
    private Map<String, String> operatingHours;
    private List<String> amenities;
    private Map<String, String> policies;
    private Map<String, Object> location;
}
