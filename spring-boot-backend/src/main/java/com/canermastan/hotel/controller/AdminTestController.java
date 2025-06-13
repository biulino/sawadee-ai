package com.canermastan.hotel.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin-test")
public class AdminTestController {

    @GetMapping("/info")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> getAdminInfo(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome Admin!");
        response.put("username", jwt.getClaimAsString("preferred_username"));
        response.put("roles", jwt.getClaimAsMap("realm_access"));
        response.put("email", jwt.getClaimAsString("email"));
        response.put("name", jwt.getClaimAsString("name"));
        return response;
    }

    @GetMapping("/customer")
    @PreAuthorize("hasRole('client_customer')")
    public Map<String, Object> getCustomerInfo(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome Customer!");
        response.put("username", jwt.getClaimAsString("preferred_username"));
        return response;
    }

    @GetMapping("/owner")
    @PreAuthorize("hasRole('client_hotel_owner')")
    public Map<String, Object> getOwnerInfo(@AuthenticationPrincipal Jwt jwt) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Welcome Hotel Owner!");
        response.put("username", jwt.getClaimAsString("preferred_username"));
        return response;
    }
}
