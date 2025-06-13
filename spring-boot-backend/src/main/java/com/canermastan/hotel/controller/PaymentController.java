package com.canermastan.hotel.controller;

import com.canermastan.hotel.entity.Payment;
import com.canermastan.hotel.mapper.DTOMapper;
import com.canermastan.hotel.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final DTOMapper dtoMapper;

    /**
     * Process a payment for a reservation
     */
    @PostMapping("/process/{reservationId}")
    public ResponseEntity<Map<String, Object>> processPayment(
            @PathVariable Long reservationId,
            @RequestParam String paymentMethod,
            @RequestBody Map<String, String> paymentDetails) {
        
        Map<String, Object> result = paymentService.processPayment(
                reservationId, paymentMethod, paymentDetails);
        
        return ResponseEntity.ok(result);
    }
      /**
     * Refund a payment for a reservation
     */
    @PostMapping("/refund/{reservationId}")
    public ResponseEntity<Map<String, Object>> refundPayment(
            @PathVariable Long reservationId) {
        
        Map<String, Object> result = paymentService.refundPayment(reservationId);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Process partial refund for a reservation
     */
    @PostMapping("/partial-refund/{reservationId}")
    public ResponseEntity<Map<String, Object>> partialRefund(
            @PathVariable Long reservationId,
            @RequestParam BigDecimal refundAmount) {
        
        Map<String, Object> result = paymentService.partialRefund(reservationId, refundAmount);
        
        return ResponseEntity.ok(result);
    }
    
    /**
     * Get payment history for a reservation
     */
    @GetMapping("/history/{reservationId}")
    public ResponseEntity<List<Payment>> getPaymentHistory(@PathVariable Long reservationId) {
        List<Payment> payments = paymentService.getPaymentHistory(reservationId);
        return ResponseEntity.ok(payments);
    }
    
    /**
     * Get payment by transaction ID
     */
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<Payment> getPaymentByTransactionId(@PathVariable String transactionId) {
        Optional<Payment> payment = paymentService.getPaymentByTransactionId(transactionId);
        
        if (payment.isPresent()) {
            return ResponseEntity.ok(payment.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Get payment analytics for a date range
     */
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getPaymentAnalytics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        Map<String, Object> analytics = paymentService.getPaymentAnalytics(startDate, endDate);
        return ResponseEntity.ok(analytics);
    }
    
    /**
     * Process pending payments (admin endpoint)
     */
    @PostMapping("/process-pending")
    public ResponseEntity<Map<String, Object>> processPendingPayments() {
        int processedCount = paymentService.processPendingPayments();
        
        Map<String, Object> result = Map.of(
            "success", true,
            "processedCount", processedCount,
            "message", "Processed " + processedCount + " pending payments"
        );
        
        return ResponseEntity.ok(result);
    }
}