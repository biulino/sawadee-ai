package com.sawadeeai.controllers;

import com.sawadeeai.entities.Hotel;
import com.sawadeeai.entities.Tenant;
import com.sawadeeai.services.HotelService;
import com.sawadeeai.services.TenantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
public class HotelController {
    
    private final HotelService hotelService;
    private final TenantService tenantService;
    
    @Autowired
    public HotelController(HotelService hotelService, TenantService tenantService) {
        this.hotelService = hotelService;
        this.tenantService = tenantService;
    }
    
    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels(@RequestHeader(value = "X-Tenant-ID", required = false) String tenantDomain) {
        if (tenantDomain != null) {
            return tenantService.getTenantByDomain(tenantDomain)
                .map(tenant -> ResponseEntity.ok(hotelService.getHotelsByTenant(tenant)))
                .orElse(ResponseEntity.notFound().build());
        }
        return ResponseEntity.ok(hotelService.getAllHotels());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable UUID id) {
        return hotelService.getHotelById(id)
            .map(hotel -> ResponseEntity.ok(hotel))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<Hotel> createHotel(
            @RequestBody Hotel hotel, 
            @RequestHeader(value = "X-Tenant-ID", required = true) String tenantDomain) {
        
        return tenantService.getTenantByDomain(tenantDomain)
            .map(tenant -> {
                hotel.setTenant(tenant);
                Hotel createdHotel = hotelService.createHotel(hotel);
                return ResponseEntity.ok(createdHotel);
            })
            .orElse(ResponseEntity.badRequest().build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Hotel> updateHotel(@PathVariable UUID id, @RequestBody Hotel hotelDetails) {
        try {
            Hotel updatedHotel = hotelService.updateHotel(id, hotelDetails);
            return ResponseEntity.ok(updatedHotel);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable UUID id) {
        try {
            hotelService.deleteHotel(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @GetMapping("/{id}/info")
    public ResponseEntity<Object> getHotelInfo(@PathVariable UUID id) {
        return hotelService.getHotelById(id)
            .map(hotel -> ResponseEntity.ok((Object) Map.of(
                "id", hotel.getId(),
                "name", hotel.getName(),
                "description", hotel.getDescription(),
                "address", hotel.getAddress(),
                "city", hotel.getCity(),
                "country", hotel.getCountry(),
                "phone", hotel.getPhone(),
                "email", hotel.getEmail(),
                "website", hotel.getWebsite()
            )))
            .orElse(ResponseEntity.notFound().build());
    }
}
