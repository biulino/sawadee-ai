package com.canermastan.hotel.config;

import com.canermastan.hotel.service.TenantService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TenantFilter extends OncePerRequestFilter {
    
    @Autowired
    private TenantService tenantService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // Extract tenant from header or subdomain
            String tenantKey = extractTenantKey(request);
            
            if (tenantKey != null) {
                tenantService.getTenantByKey(tenantKey)
                    .ifPresent(tenant -> TenantContext.setCurrentTenant(tenant.getId()));
            }
            
            filterChain.doFilter(request, response);
        } finally {
            TenantContext.clear();
        }
    }
    
    private String extractTenantKey(HttpServletRequest request) {
        // First try header
        String tenantKey = request.getHeader("X-Tenant-Key");
        
        if (tenantKey == null) {
            // Try subdomain extraction
            String host = request.getServerName();
            if (host != null && host.contains(".")) {
                String[] parts = host.split("\\.");
                if (parts.length > 2) { // subdomain.domain.com
                    tenantKey = parts[0];
                }
            }
        }
        
        return tenantKey;
    }
}
