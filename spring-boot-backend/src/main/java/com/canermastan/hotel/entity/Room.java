package com.canermastan.hotel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
@RequiredArgsConstructor
@Getter
@Setter
public class Room {    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", insertable = false, updatable = false)
    private Tenant tenant;

    private String roomNumber;
    private String name;
    private int capacity;
    
    // SINGLE, DOUBLE, SUITE, etc.
    @Enumerated(EnumType.STRING)
    private RoomType type;
    
    private String description;
    @Column(name = "price_per_night")
    private Double pricePerNight; // Oda bazında fiyat (otel fiyatından farklı olabilir)
    @Column(name = "has_wifi")
    private Boolean hasWifi;
    @Column(name = "has_tv")
    private Boolean hasTV;
    @Column(name = "has_balcony")
    private Boolean hasBalcony;
    @Column(name = "has_minibar")
    private Boolean hasMinibar;
    @Column(name = "floor_number")
    private Integer floorNumber;
    @Column(name = "bed_count")
    private Integer bedCount;
    
    @Enumerated(EnumType.STRING)
    private RoomStatus status = RoomStatus.AVAILABLE;

    @ManyToOne
    @JoinColumn(name = "hotel_id", referencedColumnName = "id")
    @JsonIgnore
    private Hotel hotel;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Reservation> reservations = new ArrayList<>();
    
    public enum RoomType {
        SINGLE, DOUBLE, TWIN, TRIPLE, SUITE, DELUXE, FAMILY, PRESIDENTIAL
    }
    
    public enum RoomStatus {
        AVAILABLE, OCCUPIED, MAINTENANCE, CLEANING
    }
}