package com.canermastan.hotel.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Entity
@Table(name = "hotel_info")
@RequiredArgsConstructor
@Getter
@Setter
public class HotelInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", insertable = false, updatable = false)
    private Tenant tenant;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false)
    private String address;
    
    @Column(nullable = false)
    private String phone;
    
    @Column(nullable = false)
    private String email;
    
    private String website;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    // Operating hours stored as JSON
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "operating_hours", columnDefinition = "JSON")
    private Map<String, String> operatingHours;
    
    // Amenities stored as JSON array
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "amenities", columnDefinition = "JSON")
    private List<String> amenities;
    
    // Policies stored as JSON
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "policies", columnDefinition = "JSON")
    private Map<String, String> policies;
    
    // Location information stored as JSON
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "location", columnDefinition = "JSON")
    private Map<String, Object> location;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
