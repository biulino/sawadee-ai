package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.ActivityReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityReservationRepository extends JpaRepository<ActivityReservation, Long> {
    List<ActivityReservation> findByActivityId(Long activityId);
    List<ActivityReservation> findByHotelReservationId(Long hotelReservationId);
} 