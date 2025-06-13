package com.canermastan.hotel.controller;

import com.canermastan.hotel.entity.LandingPageConfig;
import com.canermastan.hotel.entity.LandingPageBanner;
import com.canermastan.hotel.entity.ServiceShortcut;
import com.canermastan.hotel.service.LandingPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/landing-page")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LandingPageController {

    private final LandingPageService landingPageService;

    /**
     * Get current landing page configuration with banners and shortcuts
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getLandingPageConfig() {
        Map<String, Object> response = new HashMap<>();
        
        // Get configuration
        LandingPageConfig config = landingPageService.getCurrentConfig().orElse(null);
        response.put("config", config);
        
        // Get active banners
        List<LandingPageBanner> banners = landingPageService.getActiveBanners();
        response.put("banners", banners);
        
        // Get active shortcuts
        List<ServiceShortcut> shortcuts = landingPageService.getActiveShortcuts();
        response.put("shortcuts", shortcuts);
        
        return ResponseEntity.ok(response);
    }

    /**
     * Get all banners (for admin)
     */
    @GetMapping("/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LandingPageBanner>> getAllBanners() {
        List<LandingPageBanner> banners = landingPageService.getAllBanners();
        return ResponseEntity.ok(banners);
    }

    /**
     * Get all shortcuts (for admin)
     */
    @GetMapping("/shortcuts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ServiceShortcut>> getAllShortcuts() {
        List<ServiceShortcut> shortcuts = landingPageService.getAllShortcuts();
        return ResponseEntity.ok(shortcuts);
    }

    /**
     * Update landing page configuration
     */
    @PutMapping("/config")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LandingPageConfig> updateConfig(@RequestBody LandingPageConfig config) {
        LandingPageConfig updated = landingPageService.saveConfig(config);
        return ResponseEntity.ok(updated);
    }

    /**
     * Create or update a banner
     */
    @PostMapping("/banners")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LandingPageBanner> saveBanner(@RequestBody LandingPageBanner banner) {
        LandingPageBanner saved = landingPageService.saveBanner(banner);
        return ResponseEntity.ok(saved);
    }

    /**
     * Delete a banner
     */
    @DeleteMapping("/banners/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        landingPageService.deleteBanner(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Toggle banner status
     */
    @PostMapping("/banners/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LandingPageBanner> toggleBannerStatus(@PathVariable Long id) {
        LandingPageBanner updated = landingPageService.toggleBannerStatus(id);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update banner order
     */
    @PutMapping("/banners/{id}/order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateBannerOrder(@PathVariable Long id, @RequestParam Integer order) {
        landingPageService.updateBannerOrder(id, order);
        return ResponseEntity.ok().build();
    }

    /**
     * Create or update a service shortcut
     */
    @PostMapping("/shortcuts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceShortcut> saveShortcut(@RequestBody ServiceShortcut shortcut) {
        ServiceShortcut saved = landingPageService.saveShortcut(shortcut);
        return ResponseEntity.ok(saved);
    }

    /**
     * Delete a service shortcut
     */
    @DeleteMapping("/shortcuts/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteShortcut(@PathVariable Long id) {
        landingPageService.deleteShortcut(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Toggle shortcut status
     */
    @PostMapping("/shortcuts/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServiceShortcut> toggleShortcutStatus(@PathVariable Long id) {
        ServiceShortcut updated = landingPageService.toggleShortcutStatus(id);
        return ResponseEntity.ok(updated);
    }

    /**
     * Update shortcut order
     */
    @PutMapping("/shortcuts/{id}/order")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateShortcutOrder(@PathVariable Long id, @RequestParam Integer order) {
        landingPageService.updateShortcutOrder(id, order);
        return ResponseEntity.ok().build();
    }

    /**
     * Initialize default configuration
     */
    @PostMapping("/init")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> initializeDefault() {
        landingPageService.initializeDefaultConfig();
        return ResponseEntity.ok().build();
    }
}
