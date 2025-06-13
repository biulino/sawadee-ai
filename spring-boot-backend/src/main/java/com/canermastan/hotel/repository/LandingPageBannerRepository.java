package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.LandingPageBanner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LandingPageBannerRepository extends JpaRepository<LandingPageBanner, Long> {
    
    List<LandingPageBanner> findByActiveOrderByDisplayOrder(Boolean active);
    
    List<LandingPageBanner> findAllByOrderByDisplayOrder();
}
