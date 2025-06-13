package com.canermastan.hotel.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test-auth")
@CrossOrigin(origins = "*")
public class TestAuthController {

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> testLogin(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");
        
        Map<String, Object> response = new HashMap<>();
        
        // Demo users for testing
        if ("admin@sawadeeai.com".equals(username) && "Admin123!".equals(password)) {
            response.put("access_token", "demo-admin-token");
            response.put("token_type", "Bearer");
            response.put("expires_in", 3600);
            response.put("user", Map.of(
                "username", username,
                "role", "ADMIN",
                "firstName", "SawadeeAI",
                "lastName", "Administrator"
            ));
        } else if ("owner@sawadeeai.com".equals(username) && "Owner123!".equals(password)) {
            response.put("access_token", "demo-owner-token");
            response.put("token_type", "Bearer");
            response.put("expires_in", 3600);
            response.put("user", Map.of(
                "username", username,
                "role", "client_hotel_owner",
                "firstName", "Hotel",
                "lastName", "Owner"
            ));
        } else if ("guest@sawadeeai.com".equals(username) && "Guest123!".equals(password)) {
            response.put("access_token", "demo-guest-token");
            response.put("token_type", "Bearer");
            response.put("expires_in", 3600);
            response.put("user", Map.of(
                "username", username,
                "role", "client_customer",
                "firstName", "John",
                "lastName", "Doe"
            ));
        } else {
            response.put("error", "Invalid credentials");
            return ResponseEntity.status(401).body(response);
        }
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> testRegister(@RequestBody Map<String, String> registerRequest) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully");
        response.put("username", registerRequest.get("username"));
        return ResponseEntity.ok(response);
    }
}
