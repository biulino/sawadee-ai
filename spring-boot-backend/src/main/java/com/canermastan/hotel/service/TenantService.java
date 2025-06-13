package com.canermastan.hotel.service;

import com.canermastan.hotel.entity.Tenant;
import com.canermastan.hotel.repository.TenantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TenantService {
    
    @Autowired
    private TenantRepository tenantRepository;
    
    public List<Tenant> getAllTenants() {
        return tenantRepository.findAll();
    }
    
    public Optional<Tenant> getTenantById(Long id) {
        return tenantRepository.findById(id);
    }
    
    public Optional<Tenant> getTenantByKey(String tenantKey) {
        return tenantRepository.findByTenantKey(tenantKey);
    }
    
    public Optional<Tenant> getTenantByDomain(String domain) {
        return tenantRepository.findByDomain(domain);
    }
    
    public Tenant createTenant(Tenant tenant) {
        return tenantRepository.save(tenant);
    }
    
    public Tenant updateTenant(Long id, Tenant tenantDetails) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found with id: " + id));
        
        tenant.setName(tenantDetails.getName());
        tenant.setDomain(tenantDetails.getDomain());
        tenant.setLogo(tenantDetails.getLogo());
        tenant.setPrimaryColor(tenantDetails.getPrimaryColor());
        tenant.setSecondaryColor(tenantDetails.getSecondaryColor());
        tenant.setActive(tenantDetails.getActive());
        
        return tenantRepository.save(tenant);
    }
    
    public void deleteTenant(Long id) {
        tenantRepository.deleteById(id);
    }
}
