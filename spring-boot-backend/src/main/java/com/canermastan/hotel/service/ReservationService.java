package com.canermastan.hotel.service;

import com.canermastan.hotel.config.TenantContext;
import com.canermastan.hotel.entity.Hotel;
import com.canermastan.hotel.entity.Reservation;
import com.canermastan.hotel.entity.Room;
import com.canermastan.hotel.repository.HotelRepository;
import com.canermastan.hotel.repository.ReservationRepository;
import com.canermastan.hotel.repository.RoomRepository;
import com.canermastan.hotel.request.ReservationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final RoomService roomService;

    /**
     * Creates a new reservation from a request
     */
    @Transactional
    public Reservation createReservation(ReservationRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        
        // Validate hotel exists and belongs to tenant
        Hotel hotel;
        if (tenantId != null) {
            hotel = hotelRepository.findByIdAndTenantId(request.getHotelId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Hotel not found"));
        } else {
            hotel = hotelRepository.findById(request.getHotelId())
                    .orElseThrow(() -> new IllegalArgumentException("Hotel not found"));
        }
        
        // Create reservation entity from request
        Reservation reservation = new Reservation();
        reservation.setFullName(request.getFullName());
        reservation.setEmail(request.getEmail());
        reservation.setPhone(request.getPhone());
        reservation.setNumberOfGuests(request.getNumberOfGuests());
        reservation.setSpecialRequests(request.getSpecialRequests());
        reservation.setCheckInDate(request.getCheckInDate());
        reservation.setCheckOutDate(request.getCheckOutDate());
        reservation.setNumberOfRooms(request.getNumberOfRooms());
        reservation.setHotel(hotel);
        reservation.setPaymentMethod(request.getPaymentMethod());
        
        // Set tenant context
        if (tenantId != null) {
            reservation.setTenantId(tenantId);
        }
        
        // Calculate total price based on hotel price, number of rooms, and length of stay
        long nights = ChronoUnit.DAYS.between(request.getCheckInDate(), request.getCheckOutDate());
        if (nights < 1) {
            throw new IllegalArgumentException("Check-out date must be after check-in date");
        }
        
        double totalPrice = hotel.getPricePerNight() * nights * request.getNumberOfRooms();
        reservation.setTotalPrice(totalPrice);
          // Validate room exists if specified and is available
        if (request.getRoomId() != null) {
            Room room;
            if (tenantId != null) {
                room = roomRepository.findByIdAndTenantId(request.getRoomId(), tenantId)
                        .orElseThrow(() -> new IllegalArgumentException("Room not found"));
            } else {
                room = roomRepository.findById(request.getRoomId())
                        .orElseThrow(() -> new IllegalArgumentException("Room not found"));
            }
            
            // Check if room belongs to the hotel
            if (!room.getHotel().getId().equals(hotel.getId())) {
                throw new IllegalArgumentException("Room does not belong to the specified hotel");
            }
            
            // Check if room is available for the requested dates
            if (!roomService.isRoomAvailable(room.getId(), 
                    request.getCheckInDate(), 
                    request.getCheckOutDate())) {
                throw new IllegalArgumentException("Room is not available for the selected dates");
            }
            
            reservation.setRoom(room);
        } else {
            // If no specific room selected, check if hotel has enough rooms
            if (hotel.getAvailableRooms() < request.getNumberOfRooms()) {
                throw new IllegalArgumentException("Not enough available rooms");
            }
            
            // Reduce available rooms count
            hotel.setAvailableRooms(hotel.getAvailableRooms() - request.getNumberOfRooms());
            hotelRepository.save(hotel);
        }
        
        // Save and return the reservation
        return reservationRepository.save(reservation);
    }
      /**
     * Creates a new reservation from an entity directly
     * (keeping for backward compatibility)
     */
    @Transactional
    public Reservation createReservation(Reservation reservation) {
        Long tenantId = TenantContext.getCurrentTenant();
        
        // Validate hotel exists and belongs to tenant
        Hotel hotel;
        if (tenantId != null) {
            hotel = hotelRepository.findByIdAndTenantId(reservation.getHotel().getId(), tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Hotel not found"));
        } else {
            hotel = hotelRepository.findById(reservation.getHotel().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Hotel not found"));
        }
        
        // Set tenant context
        if (tenantId != null) {
            reservation.setTenantId(tenantId);
        }
        
        // Validate room exists if specified
        if (reservation.getRoom() != null && reservation.getRoom().getId() != null) {
            Room room;
            if (tenantId != null) {
                room = roomRepository.findByIdAndTenantId(reservation.getRoom().getId(), tenantId)
                        .orElseThrow(() -> new IllegalArgumentException("Room not found"));
            } else {
                room = roomRepository.findById(reservation.getRoom().getId())
                        .orElseThrow(() -> new IllegalArgumentException("Room not found"));
            }
            
            // Check if room belongs to the hotel
            if (!room.getHotel().getId().equals(hotel.getId())) {
                throw new IllegalArgumentException("Room does not belong to the specified hotel");
            }
            
            // Check if room is available for the requested dates
            if (!roomService.isRoomAvailable(room.getId(), 
                    reservation.getCheckInDate(), 
                    reservation.getCheckOutDate())) {
                throw new IllegalArgumentException("Room is not available for the selected dates");
            }
            
            reservation.setRoom(room);
        } else {
            // If no specific room selected, check if hotel has enough rooms
            if (hotel.getAvailableRooms() < reservation.getNumberOfRooms()) {
                throw new IllegalArgumentException("Not enough available rooms");
            }
            
            // Reduce available rooms count
            hotel.setAvailableRooms(hotel.getAvailableRooms() - reservation.getNumberOfRooms());
            hotelRepository.save(hotel);
        }
        
        // Calculate total price if not already set
        if (reservation.getTotalPrice() == null) {
            long nights = ChronoUnit.DAYS.between(reservation.getCheckInDate(), reservation.getCheckOutDate());
            if (nights < 1) {
                throw new IllegalArgumentException("Check-out date must be after check-in date");
            }
            
            double totalPrice = hotel.getPricePerNight() * nights * reservation.getNumberOfRooms();
            reservation.setTotalPrice(totalPrice);
        }
        
        // Set hotel reference
        reservation.setHotel(hotel);
        
        // Save and return the reservation
        return reservationRepository.save(reservation);
    }    /**
     * Gets a reservation by ID
     */
    public Optional<Reservation> getReservation(Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            return reservationRepository.findByIdAndTenantId(id, tenantId);
        }
        return reservationRepository.findById(id);
    }
    
    /**
     * Gets all reservations for a hotel
     */
    public List<Reservation> getReservationsByHotel(Long hotelId) {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            return reservationRepository.findByHotelIdAndTenantId(hotelId, tenantId);
        }
        return reservationRepository.findByHotelId(hotelId);
    }
    
    /**
     * Gets all reservations for a room
     */
    public List<Reservation> getReservationsByRoom(Long roomId) {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null) {
            return reservationRepository.findByRoomIdAndTenantId(roomId, tenantId);
        }
        return reservationRepository.findByRoomId(roomId);
    }    /**
     * Cancels a reservation
     */
    @Transactional
    public void cancelReservation(Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        Reservation reservation;
        
        if (tenantId != null) {
            reservation = reservationRepository.findByIdAndTenantId(id, tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        } else {
            reservation = reservationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        }
        
        // Update reservation status
        reservation.setStatus(Reservation.ReservationStatus.CANCELLED);
        
        Hotel hotel = reservation.getHotel();
        
        // If reservation was for specific rooms, update available rooms
        if (reservation.getNumberOfRooms() != null && reservation.getNumberOfRooms() > 0) {
            hotel.setAvailableRooms(hotel.getAvailableRooms() + reservation.getNumberOfRooms());
            hotelRepository.save(hotel);
        }
        
        // Save the reservation with updated status
        reservationRepository.save(reservation);
    }
      /**
     * Updates payment status for a reservation
     */
    @Transactional
    public Reservation updatePaymentStatus(Long id, Reservation.PaymentStatus status, String transactionId) {
        Long tenantId = TenantContext.getCurrentTenant();
        Reservation reservation;
        
        if (tenantId != null) {
            reservation = reservationRepository.findByIdAndTenantId(id, tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        } else {
            reservation = reservationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        }
        
        reservation.setPaymentStatus(status);
        
        if (transactionId != null) {
            reservation.setPaymentTransactionId(transactionId);
        }
        
        // If payment is successful, confirm the reservation
        if (status == Reservation.PaymentStatus.PAID) {
            reservation.setStatus(Reservation.ReservationStatus.CONFIRMED);
        }
        
        return reservationRepository.save(reservation);
    }
      /**
     * Check-in for a reservation
     */
    @Transactional
    public Reservation checkIn(Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        Reservation reservation;
        
        if (tenantId != null) {
            reservation = reservationRepository.findByIdAndTenantId(id, tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        } else {
            reservation = reservationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        }
        
        // Validate reservation is in CONFIRMED status
        if (reservation.getStatus() != Reservation.ReservationStatus.CONFIRMED) {
            throw new IllegalArgumentException("Reservation must be confirmed before check-in");
        }
        
        // Validate payment status is PAID
        if (reservation.getPaymentStatus() != Reservation.PaymentStatus.PAID) {
            throw new IllegalArgumentException("Payment must be completed before check-in");
        }
        
        // Validate check-in date is today or earlier
        if (reservation.getCheckInDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot check-in before the scheduled check-in date");
        }
        
        // Update reservation status
        reservation.setStatus(Reservation.ReservationStatus.CHECKED_IN);
        
        return reservationRepository.save(reservation);
    }
      /**
     * Check-out for a reservation
     */
    @Transactional
    public Reservation checkOut(Long id) {
        Long tenantId = TenantContext.getCurrentTenant();
        Reservation reservation;
        
        if (tenantId != null) {
            reservation = reservationRepository.findByIdAndTenantId(id, tenantId)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        } else {
            reservation = reservationRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        }
        
        // Validate reservation is in CHECKED_IN status
        if (reservation.getStatus() != Reservation.ReservationStatus.CHECKED_IN) {
            throw new IllegalArgumentException("Reservation must be checked-in before check-out");
        }
        
        // Update available rooms for the hotel
        Hotel hotel = reservation.getHotel();
        if (reservation.getNumberOfRooms() != null && reservation.getNumberOfRooms() > 0) {
            hotel.setAvailableRooms(hotel.getAvailableRooms() + reservation.getNumberOfRooms());
            hotelRepository.save(hotel);
        }
        
        // Update reservation status
        reservation.setStatus(Reservation.ReservationStatus.CHECKED_OUT);
        
        return reservationRepository.save(reservation);
    }
} 