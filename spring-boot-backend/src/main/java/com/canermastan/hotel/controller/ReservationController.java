package com.canermastan.hotel.controller;

import com.canermastan.hotel.dto.ReservationDTO;
import com.canermastan.hotel.entity.Reservation;
import com.canermastan.hotel.exception.ResourceNotFoundException;
import com.canermastan.hotel.mapper.DTOMapper;
import com.canermastan.hotel.request.ReservationRequest;
import com.canermastan.hotel.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final DTOMapper dtoMapper;

    @PostMapping
    public ResponseEntity<ReservationDTO> createReservation(@Valid @RequestBody ReservationRequest request) {
        Reservation saved = reservationService.createReservation(request);
        return ResponseEntity.ok(dtoMapper.toReservationDTO(saved));
    }

    // Eski yöntemi de tutalım (geri uyumluluk için)
    @PostMapping("/legacy")
    public ResponseEntity<ReservationDTO> createReservationLegacy(@RequestBody Reservation reservation) {
        Reservation saved = reservationService.createReservation(reservation);
        return ResponseEntity.ok(dtoMapper.toReservationDTO(saved));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationDTO> getReservation(@PathVariable Long id) {
        Reservation reservation = reservationService.getReservation(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", id));
        return ResponseEntity.ok(dtoMapper.toReservationDTO(reservation));
    }
    
    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<List<ReservationDTO>> getReservationsByHotel(@PathVariable Long hotelId) {
        List<Reservation> reservations = reservationService.getReservationsByHotel(hotelId);
        return ResponseEntity.ok(dtoMapper.toReservationDTOList(reservations));
    }
    
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ReservationDTO>> getReservationsByRoom(@PathVariable Long roomId) {
        List<Reservation> reservations = reservationService.getReservationsByRoom(roomId);
        return ResponseEntity.ok(dtoMapper.toReservationDTOList(reservations));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelReservation(@PathVariable Long id) {
        reservationService.cancelReservation(id);
        return ResponseEntity.ok("Rezervasyon iptal edildi.");
    }
    
    @PostMapping("/{id}/payment")
    public ResponseEntity<Map<String, Object>> processPayment(
            @PathVariable Long id,
            @RequestParam Reservation.PaymentStatus status,
            @RequestParam(required = false) String transactionId) {
        
        Reservation updated = reservationService.updatePaymentStatus(id, status, transactionId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("reservationId", updated.getId());
        
        if (updated.getPaymentStatus() != null) {
            response.put("paymentStatus", updated.getPaymentStatus().name());
        } else {
            response.put("paymentStatus", null);
        }
        
        if (updated.getStatus() != null) {
            response.put("reservationStatus", updated.getStatus().name());
        } else {
            response.put("reservationStatus", null);
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/check-in")
    public ResponseEntity<Map<String, Object>> checkIn(@PathVariable Long id) {
        Reservation updated = reservationService.checkIn(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("reservationId", updated.getId());
        
        if (updated.getStatus() != null) {
            response.put("status", updated.getStatus().name());
        } else {
            response.put("status", null);
        }
        
        response.put("message", "Check-in successful");
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/check-out")
    public ResponseEntity<Map<String, Object>> checkOut(@PathVariable Long id) {
        Reservation updated = reservationService.checkOut(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("reservationId", updated.getId());
        
        if (updated.getStatus() != null) {
            response.put("status", updated.getStatus().name());
        } else {
            response.put("status", null);
        }
        
        response.put("message", "Check-out successful");
        
        return ResponseEntity.ok(response);
    }
}
