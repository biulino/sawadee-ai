package com.canermastan.hotel.service;

import com.canermastan.hotel.config.TenantContext;
import com.canermastan.hotel.entity.Reservation;
import com.canermastan.hotel.entity.Room;
import com.canermastan.hotel.repository.ReservationRepository;
import com.canermastan.hotel.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;

    public boolean isRoomAvailable(Long roomId, LocalDate startDate, LocalDate endDate) {
        List<Reservation> reservations = reservationRepository.findByRoomId(roomId);

        for (Reservation reservation : reservations) {
            if ((startDate.isBefore(reservation.getCheckOutDate()) && endDate.isAfter(reservation.getCheckInDate()))) {
                return false;
            }
        }
        return true;
    }    public List<Room> getAvailableRooms(Long hotelId, LocalDate startDate, LocalDate endDate) {
        Long tenantId = TenantContext.getCurrentTenant();
        List<Room> rooms;
        
        if (tenantId != null) {
            rooms = roomRepository.findByHotelIdAndTenantId(hotelId, tenantId);
        } else {
            rooms = roomRepository.findByHotelId(hotelId);
        }
        
        List<Room> availableRooms = new ArrayList<>();

        for (Room room : rooms) {
            if (isRoomAvailable(room.getId(), startDate, endDate)) {
                availableRooms.add(room);
            }
        }
        return availableRooms;
    }
}
