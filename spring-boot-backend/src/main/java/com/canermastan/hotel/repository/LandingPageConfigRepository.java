package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.LandingPageConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LandingPageConfigRepository extends JpaRepository<LandingPageConfig, Long> {
    
    Optional<LandingPageConfig> findByActiveTrue();
    
    @Modifying
    @Query("UPDATE LandingPageConfig c SET c.active = false")
    void deactivateAll();
}
