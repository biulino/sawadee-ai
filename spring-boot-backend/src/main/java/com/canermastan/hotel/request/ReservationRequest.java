package com.canermastan.hotel.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ReservationRequest {
    
    @NotEmpty(message = "Ad soyad boş olamaz")
    private String fullName;
    
    @NotEmpty(message = "Email adresi boş olamaz")
    @Email(message = "Geçerli bir email adresi giriniz")
    private String email;
    
    @NotEmpty(message = "Telefon numarası boş olamaz")
    private String phone;
    
    private Integer numberOfGuests;
    
    private String specialRequests;
    
    @NotNull(message = "Giriş tarihi boş olamaz")
    @Future(message = "Giriş tarihi gelecekte olmalıdır")
    private LocalDate checkInDate;
    
    @NotNull(message = "Çıkış tarihi boş olamaz")
    @Future(message = "Çıkış tarihi gelecekte olmalıdır")
    private LocalDate checkOutDate;
    
    @NotNull(message = "Oda sayısı boş olamaz")
    private Integer numberOfRooms = 1;
    
    @NotNull(message = "Otel ID boş olamaz")
    private Long hotelId;
    
    private Long roomId; // Opsiyonel, belirli bir oda isteniyorsa
    
    private String paymentMethod;
} 