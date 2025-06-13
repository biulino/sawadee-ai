package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.HotelInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HotelInfoRepository extends JpaRepository<HotelInfo, Long> {
    
    /**
     * Find hotel info by tenant ID
     */
    Optional<HotelInfo> findByTenantId(Long tenantId);
    
    /**
     * Check if hotel info exists for a tenant
     */
    boolean existsByTenantId(Long tenantId);
    
    /**
     * Delete hotel info by tenant ID
     */
    void deleteByTenantId(Long tenantId);
}
