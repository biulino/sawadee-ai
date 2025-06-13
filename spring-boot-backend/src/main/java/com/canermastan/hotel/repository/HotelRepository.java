package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByCityIgnoreCase(String city);

    @Query("SELECT COUNT(h) FROM Hotel h WHERE LOWER(h.city) = LOWER(:city)")
    long countByCity(@Param("city") String city);
    
    @Query("SELECT h FROM Hotel h WHERE "
            + "(:city IS NULL OR h.city = :city) AND "
            + "(:minPrice IS NULL OR h.pricePerNight >= :minPrice) AND "
            + "(:maxPrice IS NULL OR h.pricePerNight <= :maxPrice)")
    List<Hotel> search(
            @Param("city") String city,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice
    );
    
    // Tenant-aware methods
    List<Hotel> findByTenantId(Long tenantId);
    
    List<Hotel> findByCityIgnoreCaseAndTenantId(String city, Long tenantId);
    
    Optional<Hotel> findByIdAndTenantId(Long id, Long tenantId);
    
    @Query("SELECT COUNT(h) FROM Hotel h WHERE LOWER(h.city) = LOWER(:city) AND h.tenantId = :tenantId")
    long countByCityAndTenantId(@Param("city") String city, @Param("tenantId") Long tenantId);
    
    @Query("SELECT h FROM Hotel h WHERE "
            + "h.tenantId = :tenantId AND "
            + "(:city IS NULL OR h.city = :city) AND "
            + "(:minPrice IS NULL OR h.pricePerNight >= :minPrice) AND "
            + "(:maxPrice IS NULL OR h.pricePerNight <= :maxPrice)")
    List<Hotel> searchByTenant(
            @Param("tenantId") Long tenantId,
            @Param("city") String city,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice
    );
}
