package com.canermastan.hotel.service;

import com.canermastan.hotel.config.TenantContext;
import com.canermastan.hotel.entity.HotelInfo;
import com.canermastan.hotel.repository.HotelInfoRepository;
import com.canermastan.hotel.request.HotelInfoRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class HotelInfoService {
    
    private final HotelInfoRepository hotelInfoRepository;
    
    /**
     * Get hotel info for current tenant
     */
    public Optional<HotelInfo> getHotelInfo() {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context available");
        }
        return hotelInfoRepository.findByTenantId(tenantId);
    }
    
    /**
     * Get hotel info by tenant ID (for admin purposes)
     */
    public Optional<HotelInfo> getHotelInfoByTenantId(Long tenantId) {
        return hotelInfoRepository.findByTenantId(tenantId);
    }
    
    /**
     * Create or update hotel info for current tenant
     */
    @Transactional
    public HotelInfo saveHotelInfo(HotelInfoRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context available");
        }
        
        // Check if hotel info already exists for this tenant
        Optional<HotelInfo> existingInfo = hotelInfoRepository.findByTenantId(tenantId);
        
        HotelInfo hotelInfo;
        if (existingInfo.isPresent()) {
            // Update existing info
            hotelInfo = existingInfo.get();
            updateHotelInfoFromRequest(hotelInfo, request);
        } else {
            // Create new info
            hotelInfo = createHotelInfoFromRequest(request, tenantId);
        }
        
        return hotelInfoRepository.save(hotelInfo);
    }
    
    /**
     * Update hotel info for current tenant
     */
    @Transactional
    public HotelInfo updateHotelInfo(HotelInfoRequest request) {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context available");
        }
        
        HotelInfo hotelInfo = hotelInfoRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalArgumentException("Hotel info not found for tenant"));
        
        updateHotelInfoFromRequest(hotelInfo, request);
        return hotelInfoRepository.save(hotelInfo);
    }
    
    /**
     * Delete hotel info for current tenant
     */
    @Transactional
    public void deleteHotelInfo() {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            throw new IllegalStateException("No tenant context available");
        }
        
        hotelInfoRepository.deleteByTenantId(tenantId);
    }
    
    /**
     * Check if hotel info exists for current tenant
     */
    public boolean hotelInfoExists() {
        Long tenantId = TenantContext.getCurrentTenant();
        if (tenantId == null) {
            return false;
        }
        return hotelInfoRepository.existsByTenantId(tenantId);
    }
    
    private HotelInfo createHotelInfoFromRequest(HotelInfoRequest request, Long tenantId) {
        HotelInfo hotelInfo = new HotelInfo();
        hotelInfo.setTenantId(tenantId);
        updateHotelInfoFromRequest(hotelInfo, request);
        return hotelInfo;
    }
    
    private void updateHotelInfoFromRequest(HotelInfo hotelInfo, HotelInfoRequest request) {
        hotelInfo.setName(request.getName());
        hotelInfo.setAddress(request.getAddress());
        hotelInfo.setPhone(request.getPhone());
        hotelInfo.setEmail(request.getEmail());
        hotelInfo.setWebsite(request.getWebsite());
        hotelInfo.setDescription(request.getDescription());
        hotelInfo.setOperatingHours(request.getOperatingHours());
        hotelInfo.setAmenities(request.getAmenities());
        hotelInfo.setPolicies(request.getPolicies());
        hotelInfo.setLocation(request.getLocation());
    }
}
