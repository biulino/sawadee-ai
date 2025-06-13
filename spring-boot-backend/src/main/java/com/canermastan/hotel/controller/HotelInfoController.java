package com.canermastan.hotel.controller;

import com.canermastan.hotel.dto.HotelInfoDTO;
import com.canermastan.hotel.entity.HotelInfo;
import com.canermastan.hotel.mapper.DTOMapper;
import com.canermastan.hotel.request.HotelInfoRequest;
import com.canermastan.hotel.service.HotelInfoService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/hotel-info")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HotelInfoController {
    
    private static final Logger logger = LoggerFactory.getLogger(HotelInfoController.class);
    
    private final HotelInfoService hotelInfoService;
    private final DTOMapper dtoMapper;
    
    /**
     * Get hotel information for current tenant
     */
    @GetMapping
    public ResponseEntity<?> getHotelInfo() {
        try {
            Optional<HotelInfo> hotelInfo = hotelInfoService.getHotelInfo();
            
            if (hotelInfo.isPresent()) {
                HotelInfoDTO dto = dtoMapper.toHotelInfoDTO(hotelInfo.get());
                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IllegalStateException e) {
            logger.error("No tenant context available", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Tenant context required"));
        } catch (Exception e) {
            logger.error("Error retrieving hotel info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve hotel information"));
        }
    }
    
    /**
     * Create new hotel information
     */
    @PostMapping
    public ResponseEntity<?> createHotelInfo(@Valid @RequestBody HotelInfoRequest request) {
        try {
            // Check if hotel info already exists
            if (hotelInfoService.hotelInfoExists()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Hotel information already exists. Use PUT to update."));
            }
            
            HotelInfo savedHotelInfo = hotelInfoService.saveHotelInfo(request);
            HotelInfoDTO dto = dtoMapper.toHotelInfoDTO(savedHotelInfo);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalStateException e) {
            logger.error("No tenant context available", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Tenant context required"));
        } catch (Exception e) {
            logger.error("Error creating hotel info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create hotel information"));
        }
    }
    
    /**
     * Update existing hotel information
     */
    @PutMapping
    public ResponseEntity<?> updateHotelInfo(@Valid @RequestBody HotelInfoRequest request) {
        try {
            HotelInfo updatedHotelInfo = hotelInfoService.updateHotelInfo(request);
            HotelInfoDTO dto = dtoMapper.toHotelInfoDTO(updatedHotelInfo);
            
            return ResponseEntity.ok(dto);
        } catch (IllegalStateException e) {
            logger.error("No tenant context available", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Tenant context required"));
        } catch (IllegalArgumentException e) {
            logger.error("Hotel info not found for update", e);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("Error updating hotel info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update hotel information"));
        }
    }
    
    /**
     * Create or update hotel information (upsert operation)
     */
    @PostMapping("/upsert")
    public ResponseEntity<?> upsertHotelInfo(@Valid @RequestBody HotelInfoRequest request) {
        try {
            HotelInfo savedHotelInfo = hotelInfoService.saveHotelInfo(request);
            HotelInfoDTO dto = dtoMapper.toHotelInfoDTO(savedHotelInfo);
            
            HttpStatus status = hotelInfoService.hotelInfoExists() ? 
                HttpStatus.OK : HttpStatus.CREATED;
            
            return ResponseEntity.status(status).body(dto);
        } catch (IllegalStateException e) {
            logger.error("No tenant context available", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Tenant context required"));
        } catch (Exception e) {
            logger.error("Error saving hotel info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to save hotel information"));
        }
    }
    
    /**
     * Delete hotel information
     */
    @DeleteMapping
    public ResponseEntity<?> deleteHotelInfo() {
        try {
            hotelInfoService.deleteHotelInfo();
            return ResponseEntity.ok(Map.of("message", "Hotel information deleted successfully"));
        } catch (IllegalStateException e) {
            logger.error("No tenant context available", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Tenant context required"));
        } catch (Exception e) {
            logger.error("Error deleting hotel info", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete hotel information"));
        }
    }
    
    /**
     * Check if hotel information exists
     */
    @GetMapping("/exists")
    public ResponseEntity<?> checkHotelInfoExists() {
        try {
            boolean exists = hotelInfoService.hotelInfoExists();
            return ResponseEntity.ok(Map.of("exists", exists));
        } catch (IllegalStateException e) {
            logger.error("No tenant context available", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Tenant context required"));
        } catch (Exception e) {
            logger.error("Error checking hotel info existence", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to check hotel information"));
        }
    }
    
    /**
     * Get hotel information by tenant ID (admin endpoint)
     */
    @GetMapping("/admin/{tenantId}")
    public ResponseEntity<?> getHotelInfoByTenantId(@PathVariable Long tenantId) {
        try {
            Optional<HotelInfo> hotelInfo = hotelInfoService.getHotelInfoByTenantId(tenantId);
            
            if (hotelInfo.isPresent()) {
                HotelInfoDTO dto = dtoMapper.toHotelInfoDTO(hotelInfo.get());
                return ResponseEntity.ok(dto);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error retrieving hotel info for tenant: {}", tenantId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to retrieve hotel information"));
        }
    }
}
