package com.canermastan.hotel.request;

import com.canermastan.hotel.entity.Room;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class RoomRequest {
    
    @NotEmpty(message = "Oda numarası boş olamaz")
    private String roomNumber;
    
    private String name;
    
    @NotNull(message = "Kapasite boş olamaz")
    @Positive(message = "Kapasite pozitif bir sayı olmalıdır")
    private int capacity;
    
    @NotNull(message = "Otel ID boş olamaz")
    private Long hotelId;
    
    private Room.RoomType type;
    
    private String description;
    
    private Double pricePerNight;
    
    private boolean hasWifi = false;
    
    private boolean hasTV = false;
    
    private boolean hasBalcony = false;
    
    private boolean hasMinibar = false;
    
    private Integer floorNumber;
    
    private Integer bedCount;
    
    private Room.RoomStatus status = Room.RoomStatus.AVAILABLE;
}
