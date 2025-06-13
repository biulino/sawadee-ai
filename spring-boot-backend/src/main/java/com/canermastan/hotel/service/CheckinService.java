package com.canermastan.hotel.service;

import com.canermastan.hotel.entity.CheckinRecord;
import com.canermastan.hotel.entity.Reservation;
import com.canermastan.hotel.repository.CheckinRecordRepository;
import com.canermastan.hotel.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Service to handle AI-powered check-in process with passport scanning and FaceIO verification.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CheckinService {

    private final CheckinRecordRepository checkinRecordRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationService reservationService;
    private final RestTemplate restTemplate;

    @Value("${app.upload.passport-dir:uploads/passports}")
    private String passportUploadDir;

    @Value("${app.faceio.api-key:}")
    private String faceIOApiKey;

    @Value("${app.faceio.app-id:}")
    private String faceIOAppId;

    @Value("${app.mrz.api-url:https://api.mindee.net/v1/products/mindee/passport/v1/predict}")
    private String mrzApiUrl;

    @Value("${app.mrz.api-key:}")
    private String mrzApiKey;

    /**
     * Start a new check-in process
     */
    @Transactional
    public CheckinRecord startCheckin(Long reservationId, String guestEmail) {
        // Validate reservation
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        // Validate guest email matches reservation
        if (!reservation.getEmail().equalsIgnoreCase(guestEmail)) {
            throw new IllegalArgumentException("Email does not match reservation");
        }

        // Check if check-in already in progress
        Optional<CheckinRecord> existingCheckin = checkinRecordRepository
                .findByReservationIdAndStatusIn(reservationId, 
                    Arrays.asList(CheckinRecord.CheckinStatus.IN_PROGRESS, 
                                CheckinRecord.CheckinStatus.PASSPORT_UPLOADED,
                                CheckinRecord.CheckinStatus.PASSPORT_VERIFIED,
                                CheckinRecord.CheckinStatus.PENDING_FACE_VERIFICATION));

        if (existingCheckin.isPresent()) {
            return existingCheckin.get();
        }

        // Create new check-in record
        CheckinRecord checkinRecord = new CheckinRecord();
        checkinRecord.setReservation(reservation);
        checkinRecord.setGuestEmail(guestEmail);
        checkinRecord.setStatus(CheckinRecord.CheckinStatus.IN_PROGRESS);
        checkinRecord.setStartedAt(LocalDateTime.now());
        checkinRecord.setCreatedAt(LocalDateTime.now());
        checkinRecord.setUpdatedAt(LocalDateTime.now());

        return checkinRecordRepository.save(checkinRecord);
    }

    /**
     * Upload and process passport image
     */
    @Transactional
    public CheckinRecord uploadPassport(Long checkinId, MultipartFile passportImage) {
        CheckinRecord checkinRecord = getCheckinRecord(checkinId);

        // Validate check-in status
        if (checkinRecord.getStatus() != CheckinRecord.CheckinStatus.IN_PROGRESS &&
            checkinRecord.getStatus() != CheckinRecord.CheckinStatus.PASSPORT_UPLOADED) {
            throw new IllegalStateException("Invalid check-in status for passport upload");
        }

        try {
            // Save passport image
            String fileName = savePassportImage(passportImage, checkinId);
            checkinRecord.setPassportImagePath(fileName);
            checkinRecord.setStatus(CheckinRecord.CheckinStatus.PASSPORT_UPLOADED);
            checkinRecord.setUpdatedAt(LocalDateTime.now());

            checkinRecordRepository.save(checkinRecord);

            // Process passport asynchronously
            processPassportAsync(checkinRecord);

            return checkinRecord;

        } catch (IOException e) {
            log.error("Failed to save passport image for check-in: {}", checkinId, e);
            throw new RuntimeException("Failed to save passport image");
        }
    }

    /**
     * Get passport verification status
     */
    public Map<String, Object> getPassportStatus(Long checkinId) {
        CheckinRecord checkinRecord = getCheckinRecord(checkinId);
        
        Map<String, Object> status = new HashMap<>();
        status.put("checkinId", checkinId);
        status.put("status", checkinRecord.getStatus().name());
        status.put("passportUploaded", checkinRecord.getPassportImagePath() != null);
        status.put("passportVerified", checkinRecord.getPassportVerified() != null ? checkinRecord.getPassportVerified() : false);
          if (checkinRecord.getPassportData() != null) {
            status.put("passportData", checkinRecord.getPassportData());
        }
        
        if (checkinRecord.getVerificationErrors() != null) {
            status.put("errors", checkinRecord.getVerificationErrors());
        }

        return status;
    }

    /**
     * Start FaceIO liveness verification
     */
    @Transactional
    public Map<String, Object> startLivenessVerification(Long checkinId) {
        CheckinRecord checkinRecord = getCheckinRecord(checkinId);

        // Validate passport is verified
        if (!Boolean.TRUE.equals(checkinRecord.getPassportVerified())) {
            throw new IllegalStateException("Passport must be verified before liveness check");
        }

        // Update status
        checkinRecord.setStatus(CheckinRecord.CheckinStatus.PENDING_FACE_VERIFICATION);
        checkinRecord.setUpdatedAt(LocalDateTime.now());
        checkinRecordRepository.save(checkinRecord);

        // Return FaceIO configuration
        Map<String, Object> response = new HashMap<>();
        response.put("faceIOAppId", faceIOAppId);
        response.put("checkinId", checkinId);
        response.put("sessionId", UUID.randomUUID().toString());

        return response;
    }

    /**
     * Complete liveness verification
     */
    @Transactional
    public CheckinRecord completeLivenessVerification(Long checkinId, String faceIOResponse, boolean verified) {
        CheckinRecord checkinRecord = getCheckinRecord(checkinId);

        checkinRecord.setFaceioResponse(faceIOResponse);
        checkinRecord.setLivenessVerified(verified);
        checkinRecord.setUpdatedAt(LocalDateTime.now());

        if (verified) {
            // Complete check-in process
            checkinRecord.setStatus(CheckinRecord.CheckinStatus.COMPLETED);
            checkinRecord.setCompletedAt(LocalDateTime.now());

            // Perform actual hotel check-in
            try {
                reservationService.checkIn(checkinRecord.getReservation().getId());
                log.info("Successfully completed AI check-in for reservation: {}", 
                        checkinRecord.getReservation().getId());
            } catch (Exception e) {
                log.error("Failed to complete hotel check-in after AI verification", e);
                checkinRecord.setStatus(CheckinRecord.CheckinStatus.FAILED);
                checkinRecord.setVerificationErrors("Failed to complete hotel check-in: " + e.getMessage());
            }
        } else {
            checkinRecord.setStatus(CheckinRecord.CheckinStatus.FAILED);
            checkinRecord.setVerificationErrors("Liveness verification failed");
        }

        return checkinRecordRepository.save(checkinRecord);
    }

    /**
     * Cancel check-in process
     */
    @Transactional
    public void cancelCheckin(Long checkinId) {
        CheckinRecord checkinRecord = getCheckinRecord(checkinId);
        checkinRecord.setStatus(CheckinRecord.CheckinStatus.CANCELLED);
        checkinRecord.setUpdatedAt(LocalDateTime.now());
        checkinRecordRepository.save(checkinRecord);
    }

    /**
     * Get check-in record by ID
     */
    public CheckinRecord getCheckinRecord(Long checkinId) {
        return checkinRecordRepository.findById(checkinId)
                .orElseThrow(() -> new IllegalArgumentException("Check-in record not found"));
    }

    /**
     * Get check-in records for a reservation
     */
    public List<CheckinRecord> getCheckinsByReservation(Long reservationId) {
        return checkinRecordRepository.findByReservationIdOrderByCreatedAtDesc(reservationId);
    }

    /**
     * Save passport image to file system
     */
    private String savePassportImage(MultipartFile file, Long checkinId) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(passportUploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : ".jpg";
        
        String fileName = "passport_" + checkinId + "_" + System.currentTimeMillis() + extension;
        Path filePath = uploadPath.resolve(fileName);

        // Save file
        Files.copy(file.getInputStream(), filePath);

        return fileName;
    }

    /**
     * Process passport image asynchronously using MRZ API
     */
    private void processPassportAsync(CheckinRecord checkinRecord) {
        // This would typically be done in a separate thread or async method
        // For now, we'll do a synchronous call but in production this should be async
        
        try {
            // Simulate MRZ processing delay
            Thread.sleep(2000);

            // In a real implementation, we would:
            // 1. Read the image file
            // 2. Send it to an MRZ processing API (like Mindee, AWS Textract, etc.)
            // 3. Parse the MRZ data
            // 4. Validate the passport            // For demo purposes, we'll simulate successful processing
            Map<String, String> passportData = simulatePassportProcessing();
            
            checkinRecord.setPassportData(new HashMap<>(passportData));
            checkinRecord.setPassportVerified(true);
            checkinRecord.setStatus(CheckinRecord.CheckinStatus.PASSPORT_VERIFIED);
            checkinRecord.setUpdatedAt(LocalDateTime.now());
            
            checkinRecordRepository.save(checkinRecord);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Passport processing interrupted for check-in: {}", checkinRecord.getId());
        } catch (Exception e) {
            log.error("Failed to process passport for check-in: {}", checkinRecord.getId(), e);
            
            checkinRecord.setPassportVerified(false);
            checkinRecord.setStatus(CheckinRecord.CheckinStatus.FAILED);
            checkinRecord.setVerificationErrors("Passport processing failed: " + e.getMessage());
            checkinRecord.setUpdatedAt(LocalDateTime.now());
            
            checkinRecordRepository.save(checkinRecord);
        }
    }

    /**
     * Simulate passport MRZ processing (replace with real API call)
     */
    private Map<String, String> simulatePassportProcessing() {
        Map<String, String> data = new HashMap<>();
        data.put("documentType", "P");
        data.put("countryCode", "TUR");
        data.put("surname", "KAPADOKYA");
        data.put("givenNames", "GUEST");
        data.put("passportNumber", "T12345678");
        data.put("nationality", "TUR");
        data.put("dateOfBirth", "1990-01-01");
        data.put("sex", "M");
        data.put("expirationDate", "2030-12-31");
        data.put("personalNumber", "");
        return data;
    }

    /**
     * Convert map to JSON string
     */
    private String convertMapToJson(Map<String, String> map) {
        StringBuilder json = new StringBuilder("{");
        boolean first = true;
        for (Map.Entry<String, String> entry : map.entrySet()) {
            if (!first) json.append(",");
            json.append("\"").append(entry.getKey()).append("\":\"").append(entry.getValue()).append("\"");
            first = false;
        }
        json.append("}");
        return json.toString();
    }

    /**
     * Parse passport data from JSON string
     */
    private Map<String, String> parsePassportData(String jsonData) {
        Map<String, String> data = new HashMap<>();
        if (jsonData == null || jsonData.trim().isEmpty()) {
            return data;
        }

        // Simple JSON parsing (in production, use Jackson or similar)
        Pattern pattern = Pattern.compile("\"([^\"]+)\"\\s*:\\s*\"([^\"]+)\"");
        Matcher matcher = pattern.matcher(jsonData);
        
        while (matcher.find()) {
            data.put(matcher.group(1), matcher.group(2));
        }
        
        return data;
    }

    /**
     * Get active check-in for reservation
     */
    public Optional<CheckinRecord> getActiveCheckinForReservation(Long reservationId) {
        return checkinRecordRepository.findByReservationIdAndStatusIn(reservationId,
                Arrays.asList(CheckinRecord.CheckinStatus.IN_PROGRESS,
                            CheckinRecord.CheckinStatus.PASSPORT_UPLOADED,
                            CheckinRecord.CheckinStatus.PASSPORT_VERIFIED,
                            CheckinRecord.CheckinStatus.PENDING_FACE_VERIFICATION));
    }

    /**
     * Validate passport data against reservation
     */
    private boolean validatePassportAgainstReservation(CheckinRecord checkinRecord, Map<String, String> passportData) {
        Reservation reservation = checkinRecord.getReservation();
        
        // Extract names from reservation
        String[] reservationNames = reservation.getFullName().toLowerCase().split("\\s+");
        String passportSurname = passportData.get("surname").toLowerCase();
        String passportGivenNames = passportData.get("givenNames").toLowerCase();

        // Simple name matching (in production, use more sophisticated matching)
        boolean nameMatch = false;
        for (String name : reservationNames) {
            if (passportSurname.contains(name) || passportGivenNames.contains(name)) {
                nameMatch = true;
                break;
            }
        }

        return nameMatch;
    }
}
