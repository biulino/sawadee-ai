package com.canermastan.hotel.controller;

import com.canermastan.hotel.entity.CheckinRecord;
import com.canermastan.hotel.service.CheckinService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/checkin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CheckinController {

    private final CheckinService checkinService;

    /**
     * Start a new AI-powered check-in process
     */
    @PostMapping("/start")
    public ResponseEntity<CheckinRecord> startCheckin(
            @RequestParam Long reservationId,
            @RequestParam String guestEmail) {
        CheckinRecord checkinRecord = checkinService.startCheckin(reservationId, guestEmail);
        return ResponseEntity.ok(checkinRecord);
    }

    /**
     * Upload passport image for verification
     */
    @PostMapping(value = "/{checkinId}/passport", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CheckinRecord> uploadPassport(
            @PathVariable Long checkinId,
            @RequestParam("passportImage") MultipartFile passportImage) {
        CheckinRecord updated = checkinService.uploadPassport(checkinId, passportImage);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get passport verification status
     */
    @GetMapping("/{checkinId}/passport/status")
    public ResponseEntity<Map<String, Object>> getPassportStatus(@PathVariable Long checkinId) {
        Map<String, Object> status = checkinService.getPassportStatus(checkinId);
        return ResponseEntity.ok(status);
    }

    /**
     * Start FaceIO liveness verification
     */
    @PostMapping("/{checkinId}/liveness/start")
    public ResponseEntity<Map<String, Object>> startLivenessVerification(@PathVariable Long checkinId) {
        Map<String, Object> response = checkinService.startLivenessVerification(checkinId);
        return ResponseEntity.ok(response);
    }

    /**
     * Complete liveness verification
     */
    @PostMapping("/{checkinId}/liveness/complete")
    public ResponseEntity<CheckinRecord> completeLivenessVerification(
            @PathVariable Long checkinId,
            @RequestParam String faceIOResponse,
            @RequestParam boolean verified) {
        CheckinRecord updated = checkinService.completeLivenessVerification(checkinId, faceIOResponse, verified);
        return ResponseEntity.ok(updated);
    }

    /**
     * Cancel check-in process
     */
    @PostMapping("/{checkinId}/cancel")
    public ResponseEntity<Void> cancelCheckin(@PathVariable Long checkinId) {
        checkinService.cancelCheckin(checkinId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get check-in record by ID
     */
    @GetMapping("/{checkinId}")
    public ResponseEntity<CheckinRecord> getCheckinRecord(@PathVariable Long checkinId) {
        CheckinRecord checkinRecord = checkinService.getCheckinRecord(checkinId);
        return ResponseEntity.ok(checkinRecord);
    }

    /**
     * Get check-in records for a reservation
     */
    @GetMapping("/reservation/{reservationId}")
    public ResponseEntity<List<CheckinRecord>> getCheckinsByReservation(@PathVariable Long reservationId) {
        List<CheckinRecord> checkins = checkinService.getCheckinsByReservation(reservationId);
        return ResponseEntity.ok(checkins);
    }

    /**
     * Get active check-in for a reservation
     */
    @GetMapping("/reservation/{reservationId}/active")
    public ResponseEntity<CheckinRecord> getActiveCheckinForReservation(@PathVariable Long reservationId) {
        return checkinService.getActiveCheckinForReservation(reservationId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
