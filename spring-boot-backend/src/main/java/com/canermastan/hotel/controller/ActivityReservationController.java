package com.canermastan.hotel.controller;

import com.canermastan.hotel.dto.ActivityReservationDTO;
import com.canermastan.hotel.entity.ActivityReservation;
import com.canermastan.hotel.exception.ResourceNotFoundException;
import com.canermastan.hotel.mapper.DTOMapper;
import com.canermastan.hotel.request.ActivityReservationRequest;
import com.canermastan.hotel.service.ActivityReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activity-reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ActivityReservationController {

    private final ActivityReservationService activityReservationService;
    private final DTOMapper dtoMapper;

    @PostMapping
    public ResponseEntity<ActivityReservationDTO> createReservation(@RequestBody ActivityReservationRequest request) {
        ActivityReservation reservation = activityReservationService.createReservation(request);
        return new ResponseEntity<>(dtoMapper.toActivityReservationDTO(reservation), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ActivityReservationDTO> getReservation(@PathVariable Long id) {
        ActivityReservation reservation = activityReservationService.getReservation(id)
            .orElseThrow(() -> new ResourceNotFoundException("Activity Reservation", "id", id));
        return ResponseEntity.ok(dtoMapper.toActivityReservationDTO(reservation));
    }
    
    @GetMapping("/activity/{activityId}")
    public ResponseEntity<List<ActivityReservationDTO>> getReservationsByActivity(@PathVariable Long activityId) {
        List<ActivityReservation> reservations = activityReservationService.getReservationsByActivity(activityId);
        return ResponseEntity.ok(dtoMapper.toActivityReservationDTOList(reservations));
    }
    
    @GetMapping("/hotel-reservation/{hotelReservationId}")
    public ResponseEntity<List<ActivityReservationDTO>> getReservationsByHotelReservation(@PathVariable Long hotelReservationId) {
        List<ActivityReservation> reservations = activityReservationService.getReservationsByHotelReservation(hotelReservationId);
        return ResponseEntity.ok(dtoMapper.toActivityReservationDTOList(reservations));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> cancelReservation(@PathVariable Long id) {
        activityReservationService.cancelReservation(id);
        return ResponseEntity.ok("Aktivite rezervasyonu iptal edildi.");
    }
    
    @PostMapping("/{id}/payment")
    public ResponseEntity<Map<String, Object>> processPayment(
            @PathVariable Long id,
            @RequestParam ActivityReservation.PaymentStatus status,
            @RequestParam(required = false) String transactionId) {
        
        ActivityReservation updated = activityReservationService.updatePaymentStatus(id, status, transactionId);
        
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
        ActivityReservation updated = activityReservationService.checkIn(id);
        
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
    
    @PostMapping("/{id}/complete")
    public ResponseEntity<Map<String, Object>> complete(@PathVariable Long id) {
        ActivityReservation updated = activityReservationService.complete(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("reservationId", updated.getId());
        
        if (updated.getStatus() != null) {
            response.put("status", updated.getStatus().name());
        } else {
            response.put("status", null);
        }
        
        response.put("message", "Activity completed successfully");
        
        return ResponseEntity.ok(response);
    }
} 