package com.canermastan.hotel.dto;

import com.canermastan.hotel.entity.Room;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomDTO {
    private Long id;
    private String roomNumber;
    private String name;
    private int capacity;
    private Room.RoomType type;
    private String description;
    private Double pricePerNight;
    private Boolean hasWifi;
    private Boolean hasTV;
    private Boolean hasBalcony;
    private Boolean hasMinibar;
    private Integer floorNumber;
    private Integer bedCount;
    private Room.RoomStatus status;
    
    // Hotel ilişkisi için yalnızca ID ve isim bilgisi
    private Long hotelId;
    private String hotelName;
} 