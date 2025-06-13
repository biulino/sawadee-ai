package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByHotelId(Long hotelId);
    
    // Tenant-aware methods
    List<Room> findByTenantId(Long tenantId);
    
    Optional<Room> findByIdAndTenantId(Long id, Long tenantId);
    
    @Query("SELECT r FROM Room r JOIN r.hotel h WHERE h.id = :hotelId AND r.tenantId = :tenantId")
    List<Room> findByHotelIdAndTenantId(@Param("hotelId") Long hotelId, @Param("tenantId") Long tenantId);
}
