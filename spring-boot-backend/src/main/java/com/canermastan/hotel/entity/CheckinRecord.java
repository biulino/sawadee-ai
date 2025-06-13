package com.canermastan.hotel.entity;

import com.canermastan.hotel.converter.JsonConverter;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "checkin_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckinRecord {    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", insertable = false, updatable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id")
    private Reservation reservation;    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "guest_email")
    private String guestEmail;

    @Column(name = "passport_image_url", length = 500)
    private String passportImageUrl;

    @Column(name = "passport_image_path", length = 500)
    private String passportImagePath;

    @Column(name = "passport_data", columnDefinition = "JSONB")
    @Convert(converter = JsonConverter.class)
    private Map<String, Object> passportData;

    @Column(name = "passport_verified")
    private Boolean passportVerified = false;

    @Column(name = "faceio_session_id")
    private String faceioSessionId;

    @Column(name = "faceio_response", columnDefinition = "TEXT")
    private String faceioResponse;

    @Column(name = "liveness_check_result", columnDefinition = "JSONB")
    @Convert(converter = JsonConverter.class)
    private Map<String, Object> livenessCheckResult;

    @Column(name = "liveness_verified")
    private Boolean livenessVerified = false;

    @Column(name = "verification_errors", columnDefinition = "TEXT")
    private String verificationErrors;    @Column(name = "checkin_status", length = 30)
    @Enumerated(EnumType.STRING)
    private CheckinStatus status = CheckinStatus.PENDING;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "checkin_timestamp")
    private LocalDateTime checkinTimestamp;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;    public enum CheckinStatus {
        PENDING,
        IN_PROGRESS,
        PASSPORT_UPLOADED,
        PASSPORT_VERIFIED,
        PENDING_FACE_VERIFICATION,
        LIVENESS_VERIFIED,
        COMPLETED,
        FAILED,
        CANCELLED
    }
}
