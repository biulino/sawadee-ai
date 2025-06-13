package com.canermastan.hotel.service;

import com.canermastan.hotel.entity.LandingPageConfig;
import com.canermastan.hotel.entity.LandingPageBanner;
import com.canermastan.hotel.entity.ServiceShortcut;
import com.canermastan.hotel.repository.LandingPageConfigRepository;
import com.canermastan.hotel.repository.LandingPageBannerRepository;
import com.canermastan.hotel.repository.ServiceShortcutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service to handle landing page configuration and content management.
 */
@Service
@RequiredArgsConstructor
public class LandingPageService {

    private final LandingPageConfigRepository configRepository;
    private final LandingPageBannerRepository bannerRepository;
    private final ServiceShortcutRepository shortcutRepository;

    /**
     * Get the current landing page configuration
     */
    public Optional<LandingPageConfig> getCurrentConfig() {
        return configRepository.findByActiveTrue();
    }

    /**
     * Create or update landing page configuration
     */
    @Transactional
    public LandingPageConfig saveConfig(LandingPageConfig config) {
        // If this is being set as active, deactivate all other configs
        if (config.getActive()) {
            configRepository.deactivateAll();
        }
        
        config.setUpdatedAt(LocalDateTime.now());
        return configRepository.save(config);
    }

    /**
     * Get all active banners ordered by display order
     */
    public List<LandingPageBanner> getActiveBanners() {
        return bannerRepository.findByActiveOrderByDisplayOrder(true);
    }

    /**
     * Get all banners for admin management
     */
    public List<LandingPageBanner> getAllBanners() {
        return bannerRepository.findAllByOrderByDisplayOrder();
    }

    /**
     * Create or update a banner
     */
    @Transactional
    public LandingPageBanner saveBanner(LandingPageBanner banner) {
        if (banner.getId() == null) {
            banner.setCreatedAt(LocalDateTime.now());
        }
        banner.setUpdatedAt(LocalDateTime.now());
        return bannerRepository.save(banner);
    }

    /**
     * Delete a banner
     */
    @Transactional
    public void deleteBanner(Long id) {
        bannerRepository.deleteById(id);
    }

    /**
     * Update banner display order
     */
    @Transactional
    public void updateBannerOrder(Long bannerId, Integer newOrder) {
        LandingPageBanner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new IllegalArgumentException("Banner not found"));
        banner.setDisplayOrder(newOrder);
        banner.setUpdatedAt(LocalDateTime.now());
        bannerRepository.save(banner);
    }

    /**
     * Get all active service shortcuts ordered by display order
     */
    public List<ServiceShortcut> getActiveShortcuts() {
        return shortcutRepository.findByActiveOrderByDisplayOrder(true);
    }

    /**
     * Get all service shortcuts for admin management
     */
    public List<ServiceShortcut> getAllShortcuts() {
        return shortcutRepository.findAllByOrderByDisplayOrder();
    }

    /**
     * Create or update a service shortcut
     */
    @Transactional
    public ServiceShortcut saveShortcut(ServiceShortcut shortcut) {
        if (shortcut.getId() == null) {
            shortcut.setCreatedAt(LocalDateTime.now());
        }
        shortcut.setUpdatedAt(LocalDateTime.now());
        return shortcutRepository.save(shortcut);
    }

    /**
     * Delete a service shortcut
     */
    @Transactional
    public void deleteShortcut(Long id) {
        shortcutRepository.deleteById(id);
    }

    /**
     * Update shortcut display order
     */
    @Transactional
    public void updateShortcutOrder(Long shortcutId, Integer newOrder) {
        ServiceShortcut shortcut = shortcutRepository.findById(shortcutId)
                .orElseThrow(() -> new IllegalArgumentException("Service shortcut not found"));
        shortcut.setDisplayOrder(newOrder);
        shortcut.setUpdatedAt(LocalDateTime.now());
        shortcutRepository.save(shortcut);
    }

    /**
     * Toggle banner active status
     */
    @Transactional
    public LandingPageBanner toggleBannerStatus(Long bannerId) {
        LandingPageBanner banner = bannerRepository.findById(bannerId)
                .orElseThrow(() -> new IllegalArgumentException("Banner not found"));
        banner.setActive(!banner.getActive());
        banner.setUpdatedAt(LocalDateTime.now());
        return bannerRepository.save(banner);
    }

    /**
     * Toggle shortcut active status
     */
    @Transactional
    public ServiceShortcut toggleShortcutStatus(Long shortcutId) {
        ServiceShortcut shortcut = shortcutRepository.findById(shortcutId)
                .orElseThrow(() -> new IllegalArgumentException("Service shortcut not found"));
        shortcut.setActive(!shortcut.getActive());
        shortcut.setUpdatedAt(LocalDateTime.now());
        return shortcutRepository.save(shortcut);
    }

    /**
     * Get banner by ID
     */
    public Optional<LandingPageBanner> getBannerById(Long id) {
        return bannerRepository.findById(id);
    }

    /**
     * Get shortcut by ID
     */
    public Optional<ServiceShortcut> getShortcutById(Long id) {
        return shortcutRepository.findById(id);
    }

    /**
     * Initialize default configuration if none exists
     */
    @Transactional
    public void initializeDefaultConfig() {
        if (configRepository.findByActiveTrue().isEmpty()) {
            LandingPageConfig defaultConfig = new LandingPageConfig();
            defaultConfig.setTitle("Welcome to Kapadokya Reservation");
            defaultConfig.setSubtitle("Experience the magic of Cappadocia with our exclusive hotel booking system");
            defaultConfig.setBannerRotationInterval(5);
            defaultConfig.setActive(true);
            defaultConfig.setCreatedAt(LocalDateTime.now());
            defaultConfig.setUpdatedAt(LocalDateTime.now());
            configRepository.save(defaultConfig);
        }
    }
}
