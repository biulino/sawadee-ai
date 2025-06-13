package com.canermastan.hotel.mapper;

import com.canermastan.hotel.dto.*;
import com.canermastan.hotel.entity.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class DTOMapper {

    // Hotel Entity -> DTO
    public HotelDTO toHotelDTO(Hotel hotel) {
        if (hotel == null) return null;
        
        return HotelDTO.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .city(hotel.getCity())
                .address(hotel.getAddress())
                .description(hotel.getDescription())
                .pricePerNight(hotel.getPricePerNight())
                .totalRooms(hotel.getTotalRooms())
                .availableRooms(hotel.getAvailableRooms())
                .build();
    }
    
    // Hotel listesi -> DTO listesi dönüşümü
    public List<HotelDTO> toHotelDTOList(List<Hotel> hotels) {
        if (hotels == null) return List.of();
        
        return hotels.stream()
                .map(this::toHotelDTO)
                .collect(Collectors.toList());
    }
    
    // Room Entity -> DTO dönüşümü
    public RoomDTO toRoomDTO(Room room) {
        if (room == null) return null;
        
        RoomDTO.RoomDTOBuilder builder = RoomDTO.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .name(room.getName())
                .capacity(room.getCapacity())
                .type(room.getType())
                .description(room.getDescription())
                .pricePerNight(room.getPricePerNight())
                .hasWifi(room.getHasWifi())
                .hasTV(room.getHasTV())
                .hasBalcony(room.getHasBalcony())
                .hasMinibar(room.getHasMinibar())
                .floorNumber(room.getFloorNumber())
                .bedCount(room.getBedCount())
                .status(room.getStatus());
        
        // Hotel bilgisini ekle (eğer null değilse)
        if (room.getHotel() != null) {
            builder.hotelId(room.getHotel().getId())
                   .hotelName(room.getHotel().getName());
        }
        
        return builder.build();
    }
    
    // Room listesi -> DTO listesi dönüşümü
    public List<RoomDTO> toRoomDTOList(List<Room> rooms) {
        if (rooms == null) return List.of();
        
        return rooms.stream()
                .map(this::toRoomDTO)
                .collect(Collectors.toList());
    }
    
    // Reservation Entity -> DTO dönüşümü
    public ReservationDTO toReservationDTO(Reservation reservation) {
        if (reservation == null) return null;
        
        ReservationDTO.ReservationDTOBuilder builder = ReservationDTO.builder()
                .id(reservation.getId())
                .fullName(reservation.getFullName())
                .email(reservation.getEmail())
                .phone(reservation.getPhone())
                .numberOfGuests(reservation.getNumberOfGuests())
                .specialRequests(reservation.getSpecialRequests())
                .checkInDate(reservation.getCheckInDate())
                .checkOutDate(reservation.getCheckOutDate())
                .numberOfRooms(reservation.getNumberOfRooms())
                .totalPrice(reservation.getTotalPrice())
                .paymentMethod(reservation.getPaymentMethod())
                .paymentTransactionId(reservation.getPaymentTransactionId())
                .createdAt(reservation.getCreatedAt())
                .updatedAt(reservation.getUpdatedAt());
        
        // Enum'ları güvenli bir şekilde dönüştür
        if (reservation.getPaymentStatus() != null) {
            builder.paymentStatus(reservation.getPaymentStatus().name());
        }
        
        if (reservation.getStatus() != null) {
            builder.status(reservation.getStatus().name());
        }
        
        // Hotel bilgisini ekle (eğer null değilse)
        if (reservation.getHotel() != null) {
            builder.hotelId(reservation.getHotel().getId())
                   .hotelName(reservation.getHotel().getName());
        }
        
        // Room bilgisini ekle (eğer null değilse)
        if (reservation.getRoom() != null) {
            builder.roomId(reservation.getRoom().getId())
                   .roomNumber(reservation.getRoom().getRoomNumber());
        }
        
        return builder.build();
    }
    
    // Reservation listesi -> DTO listesi dönüşümü
    public List<ReservationDTO> toReservationDTOList(List<Reservation> reservations) {
        if (reservations == null) return List.of();
        
        return reservations.stream()
                .map(this::toReservationDTO)
                .collect(Collectors.toList());
    }
    
    // Activity Entity -> DTO dönüşümü
    public ActivityDTO toActivityDTO(Activity activity) {
        if (activity == null) return null;
        
        ActivityDTO.ActivityDTOBuilder builder = ActivityDTO.builder()
                .id(activity.getId())
                .name(activity.getName())
                .description(activity.getDescription())
                .price(activity.getPrice())
                .capacity(activity.getCapacity())
                .availableSlots(activity.getAvailableSlots())
                .startTime(activity.getStartTime())
                .endTime(activity.getEndTime())
                .status(activity.getStatus());
        
        // Hotel bilgisini ekle (eğer null değilse)
        if (activity.getHotel() != null) {
            builder.hotelId(activity.getHotel().getId())
                   .hotelName(activity.getHotel().getName());
        }
        
        return builder.build();
    }
    
    // Activity listesi -> DTO listesi dönüşümü
    public List<ActivityDTO> toActivityDTOList(List<Activity> activities) {
        if (activities == null) return List.of();
        
        return activities.stream()
                .map(this::toActivityDTO)
                .collect(Collectors.toList());
    }
    
    // ActivityReservation Entity -> DTO dönüşümü
    public ActivityReservationDTO toActivityReservationDTO(ActivityReservation reservation) {
        if (reservation == null) return null;
        
        ActivityReservationDTO.ActivityReservationDTOBuilder builder = ActivityReservationDTO.builder()
                .id(reservation.getId())
                .fullName(reservation.getFullName())
                .email(reservation.getEmail())
                .phone(reservation.getPhone())
                .numberOfParticipants(reservation.getNumberOfParticipants())
                .specialRequests(reservation.getSpecialRequests())
                .totalPrice(reservation.getTotalPrice())
                .paymentMethod(reservation.getPaymentMethod())
                .paymentStatus(reservation.getPaymentStatus())
                .status(reservation.getStatus())
                .createdAt(reservation.getCreatedAt());
        
        // Activity bilgisini ekle (eğer null değilse)
        if (reservation.getActivity() != null) {
            builder.activityId(reservation.getActivity().getId())
                   .activityName(reservation.getActivity().getName());
        }
        
        // HotelReservation bilgisini ekle (eğer null değilse)
        if (reservation.getHotelReservation() != null) {
            builder.hotelReservationId(reservation.getHotelReservation().getId());
        }
        
        return builder.build();
    }
    
    // ActivityReservation listesi -> DTO listesi dönüşümü
    public List<ActivityReservationDTO> toActivityReservationDTOList(List<ActivityReservation> reservations) {
        if (reservations == null) return List.of();
        
        return reservations.stream()
                .map(this::toActivityReservationDTO)
                .collect(Collectors.toList());
    }
    
    // HotelInfo Entity -> DTO
    public HotelInfoDTO toHotelInfoDTO(HotelInfo hotelInfo) {
        if (hotelInfo == null) return null;
        
        return HotelInfoDTO.builder()
                .id(hotelInfo.getId())
                .tenantId(hotelInfo.getTenantId())
                .name(hotelInfo.getName())
                .address(hotelInfo.getAddress())
                .phone(hotelInfo.getPhone())
                .email(hotelInfo.getEmail())
                .website(hotelInfo.getWebsite())
                .description(hotelInfo.getDescription())
                .operatingHours(hotelInfo.getOperatingHours())
                .amenities(hotelInfo.getAmenities())
                .policies(hotelInfo.getPolicies())
                .location(hotelInfo.getLocation())
                .createdAt(hotelInfo.getCreatedAt())
                .updatedAt(hotelInfo.getUpdatedAt())
                .build();
    }
}