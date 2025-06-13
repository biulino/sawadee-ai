package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByHotelId(Long hotelId);
    
    @Query("SELECT a FROM Activity a WHERE a.hotel.id = :hotelId AND a.status = 'ACTIVE' AND a.availableSlots > 0 AND a.startTime > :now")
    List<Activity> findAvailableActivitiesByHotelId(@Param("hotelId") Long hotelId, @Param("now") LocalDateTime now);
    
    @Query("SELECT a FROM Activity a WHERE a.hotel.id = :hotelId AND a.startTime BETWEEN :startTime AND :endTime")
    List<Activity> findActivitiesInDateRange(
            @Param("hotelId") Long hotelId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
} 