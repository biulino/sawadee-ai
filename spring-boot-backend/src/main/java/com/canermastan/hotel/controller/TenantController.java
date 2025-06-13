package com.canermastan.hotel.controller;

import com.canermastan.hotel.entity.Tenant;
import com.canermastan.hotel.service.TenantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tenants")
@CrossOrigin(origins = "*")
public class TenantController {
    
    @Autowired
    private TenantService tenantService;
    
    @GetMapping
    public List<Tenant> getAllTenants() {
        return tenantService.getAllTenants();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Tenant> getTenantById(@PathVariable Long id) {
        return tenantService.getTenantById(id)
                .map(tenant -> ResponseEntity.ok().body(tenant))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/key/{tenantKey}")
    public ResponseEntity<Tenant> getTenantByKey(@PathVariable String tenantKey) {
        return tenantService.getTenantByKey(tenantKey)
                .map(tenant -> ResponseEntity.ok().body(tenant))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/domain/{domain}")
    public ResponseEntity<Tenant> getTenantByDomain(@PathVariable String domain) {
        return tenantService.getTenantByDomain(domain)
                .map(tenant -> ResponseEntity.ok().body(tenant))
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public Tenant createTenant(@RequestBody Tenant tenant) {
        return tenantService.createTenant(tenant);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Tenant> updateTenant(@PathVariable Long id, @RequestBody Tenant tenantDetails) {
        try {
            Tenant updatedTenant = tenantService.updateTenant(id, tenantDetails);
            return ResponseEntity.ok(updatedTenant);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTenant(@PathVariable Long id) {
        try {
            tenantService.deleteTenant(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
