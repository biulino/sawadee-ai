package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByHotelId(Long hotelId);
    List<Reservation> findByRoomId(Long roomId);
    
    // Tenant-aware methods
    List<Reservation> findByTenantId(Long tenantId);
    
    Optional<Reservation> findByIdAndTenantId(Long id, Long tenantId);
    
    @Query("SELECT r FROM Reservation r JOIN r.hotel h WHERE h.id = :hotelId AND r.tenantId = :tenantId")
    List<Reservation> findByHotelIdAndTenantId(@Param("hotelId") Long hotelId, @Param("tenantId") Long tenantId);
    
    @Query("SELECT r FROM Reservation r WHERE r.room.id = :roomId AND r.tenantId = :tenantId")
    List<Reservation> findByRoomIdAndTenantId(@Param("roomId") Long roomId, @Param("tenantId") Long tenantId);
}
