package com.canermastan.hotel.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/v1/demo")
public class DemoController {
    @GetMapping
    @PreAuthorize("hasRole('client_customer')")
    public String hello(@AuthenticationPrincipal Jwt jwt) {
        return new String("Hello from hotel app backend" + jwt.getClaimAsString("preferred_username"));
    }    @GetMapping("/hello-2")
    @PreAuthorize("hasRole('client_hotel_owner')")
    public String hello2(@AuthenticationPrincipal Jwt jwt) {
        // username:  jwt.getClaimAsString("preferred_username");
        // user_id:  jwt.getSubject();
        return jwt.getClaimAsString("preferred_username");
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminHello(@AuthenticationPrincipal Jwt jwt) {
        return "Hello Admin: " + jwt.getClaimAsString("preferred_username") + " - Roles: " + jwt.getClaimAsMap("realm_access");
    }

}
