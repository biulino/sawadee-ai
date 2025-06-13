package com.canermastan.hotel.service;

import com.canermastan.hotel.entity.Activity;
import com.canermastan.hotel.entity.ActivityReservation;
import com.canermastan.hotel.entity.Reservation;
import com.canermastan.hotel.repository.ActivityRepository;
import com.canermastan.hotel.repository.ActivityReservationRepository;
import com.canermastan.hotel.repository.ReservationRepository;
import com.canermastan.hotel.request.ActivityReservationRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ActivityReservationService {

    private final ActivityReservationRepository activityReservationRepository;
    private final ActivityRepository activityRepository;
    private final ReservationRepository reservationRepository;
    private final ActivityService activityService;

    /**
     * Creates a new activity reservation from a request
     */
    @Transactional
    public ActivityReservation createReservation(ActivityReservationRequest request) {
        // Validate activity exists
        Activity activity = activityRepository.findById(request.getActivityId())
                .orElseThrow(() -> new IllegalArgumentException("Activity not found"));
        
        // Validate there are enough slots available
        if (activity.getAvailableSlots() < request.getNumberOfParticipants()) {
            throw new IllegalArgumentException("Not enough available slots");
        }
        
        // Check if the activity is active
        if (activity.getStatus() != Activity.ActivityStatus.ACTIVE) {
            throw new IllegalArgumentException("Activity is not available for booking");
        }
        
        // Create reservation entity from request
        ActivityReservation reservation = new ActivityReservation();
        reservation.setFullName(request.getFullName());
        reservation.setEmail(request.getEmail());
        reservation.setPhone(request.getPhone());
        reservation.setNumberOfParticipants(request.getNumberOfParticipants());
        reservation.setSpecialRequests(request.getSpecialRequests());
        reservation.setPaymentMethod(request.getPaymentMethod());
        reservation.setActivity(activity);
        
        // Set hotel reservation if provided
        if (request.getHotelReservationId() != null) {
            Reservation hotelReservation = reservationRepository.findById(request.getHotelReservationId())
                    .orElseThrow(() -> new IllegalArgumentException("Hotel reservation not found"));
            reservation.setHotelReservation(hotelReservation);
        }
          // Calculate total price
        BigDecimal totalPrice = activity.getPrice().multiply(BigDecimal.valueOf(request.getNumberOfParticipants()));
        reservation.setTotalPrice(totalPrice);
        
        // Update available slots
        activityService.updateAvailableSlots(activity.getId(), -request.getNumberOfParticipants());
        
        // Save and return the reservation
        return activityReservationRepository.save(reservation);
    }
    
    /**
     * Gets a reservation by ID
     */
    public Optional<ActivityReservation> getReservation(Long id) {
        return activityReservationRepository.findById(id);
    }
    
    /**
     * Gets all reservations for an activity
     */
    public List<ActivityReservation> getReservationsByActivity(Long activityId) {
        return activityReservationRepository.findByActivityId(activityId);
    }
    
    /**
     * Gets all reservations associated with a hotel reservation
     */
    public List<ActivityReservation> getReservationsByHotelReservation(Long hotelReservationId) {
        return activityReservationRepository.findByHotelReservationId(hotelReservationId);
    }

    /**
     * Cancels a reservation
     */
    @Transactional
    public void cancelReservation(Long id) {
        ActivityReservation reservation = activityReservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity reservation not found"));
        
        // Update reservation status
        reservation.setStatus(ActivityReservation.ReservationStatus.CANCELLED);
        
        // Release slots
        activityService.updateAvailableSlots(
                reservation.getActivity().getId(), 
                reservation.getNumberOfParticipants()
        );
        
        // Save the reservation with updated status
        activityReservationRepository.save(reservation);
    }
    
    /**
     * Updates payment status for a reservation
     */
    @Transactional
    public ActivityReservation updatePaymentStatus(Long id, ActivityReservation.PaymentStatus status, String transactionId) {
        ActivityReservation reservation = activityReservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity reservation not found"));
        
        reservation.setPaymentStatus(status);
        
        if (transactionId != null) {
            reservation.setPaymentTransactionId(transactionId);
        }
        
        // If payment is successful, confirm the reservation
        if (status == ActivityReservation.PaymentStatus.PAID) {
            reservation.setStatus(ActivityReservation.ReservationStatus.CONFIRMED);
        }
        
        return activityReservationRepository.save(reservation);
    }
    
    /**
     * Check-in for a reservation
     */
    @Transactional
    public ActivityReservation checkIn(Long id) {
        ActivityReservation reservation = activityReservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity reservation not found"));
        
        // Validate payment status
        if (reservation.getPaymentStatus() != ActivityReservation.PaymentStatus.PAID) {
            throw new IllegalStateException("Cannot check in: Payment is not completed");
        }
        
        // Validate reservation status
        if (reservation.getStatus() != ActivityReservation.ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot check in: Reservation is not confirmed");
        }
        
        // Update status
        reservation.setStatus(ActivityReservation.ReservationStatus.CHECKED_IN);
        
        return activityReservationRepository.save(reservation);
    }
    
    /**
     * Complete a reservation
     */
    @Transactional
    public ActivityReservation complete(Long id) {
        ActivityReservation reservation = activityReservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity reservation not found"));
        
        // Validate reservation status
        if (reservation.getStatus() != ActivityReservation.ReservationStatus.CHECKED_IN && 
            reservation.getStatus() != ActivityReservation.ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot complete: Reservation status is not valid");
        }
        
        // Update status
        reservation.setStatus(ActivityReservation.ReservationStatus.COMPLETED);
        
        return activityReservationRepository.save(reservation);
    }
} 