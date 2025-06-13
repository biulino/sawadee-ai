package com.canermastan.hotel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "activities")
@RequiredArgsConstructor
@Getter
@Setter
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
      private String name;
    private String description;
    private BigDecimal price; // Aktivite başına fiyat
    private Integer capacity; // Maksimum katılımcı sayısı
    private Integer availableSlots; // Kalan slot sayısı
    
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    
    // Aktivite durumu
    @Enumerated(EnumType.STRING)
    private ActivityStatus status = ActivityStatus.ACTIVE;
    
    // Tarih bilgileri
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @ManyToOne
    @JoinColumn(name = "hotel_id", referencedColumnName = "id")
    @JsonIgnore
    private Hotel hotel;
    
    @OneToMany(mappedBy = "activity", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<ActivityReservation> reservations = new ArrayList<>();
    
    public enum ActivityStatus {
        ACTIVE, CANCELLED, COMPLETED, FULL
    }
} 