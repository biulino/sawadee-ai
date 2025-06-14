package com.sawadeeai.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
            "status", "UP",
            "service", "SawadeeAI Backend",
            "version", "1.0.0",
            "timestamp", System.currentTimeMillis()
        );
    }

    @GetMapping("/info")
    public Map<String, Object> info() {
        return Map.of(
            "application", "SawadeeAI Hotel Management System",
            "description", "AI-powered hotel management platform",
            "version", "1.0.0",
            "technologies", Map.of(
                "backend", "Spring Boot 3.x",
                "database", "PostgreSQL",
                "cache", "Redis",
                "auth", "Keycloak",
                "ai", "Python Flask Microservices"
            )
        );
    }
}
