package com.canermastan.hotel.service;

import com.canermastan.hotel.entity.Payment;
import com.canermastan.hotel.entity.Reservation;
import com.canermastan.hotel.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Enhanced Payment Service with full Payment entity integration.
 * Handles payment processing, refunds, and payment analytics.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final ReservationService reservationService;
    private final PaymentRepository paymentRepository;    /**
     * Process a payment for a reservation with full Payment entity integration
     * @param reservationId the ID of the reservation to process payment for
     * @param paymentMethod the payment method (CREDIT_CARD, PAYPAL, etc.)
     * @param paymentDetails payment details like card number, expiration, etc.
     * @return payment result with transaction ID and status
     */
    @Transactional
    public Map<String, Object> processPayment(Long reservationId, String paymentMethod, Map<String, String> paymentDetails) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Get the reservation
            Reservation reservation = reservationService.getReservation(reservationId)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
            
            // Check if payment is already processed
            if (reservation.getPaymentStatus() == Reservation.PaymentStatus.PAID) {
                result.put("success", false);
                result.put("message", "Payment already processed");
                return result;
            }
              // Create Payment entity
            Payment payment = new Payment();
            payment.setReservation(reservation);
            payment.setAmount(BigDecimal.valueOf(reservation.getTotalPrice()));
            payment.setCurrency("USD"); // Default currency, can be configurable
            payment.setPaymentMethod(Payment.PaymentMethod.valueOf(paymentMethod.toUpperCase()));
            payment.setStatus(Payment.PaymentStatus.PROCESSING);
            payment.setPaymentProcessor(determinePaymentProcessor(paymentMethod));
            payment.setCreatedAt(LocalDateTime.now());
            
            // Save initial payment record
            payment = paymentRepository.save(payment);
            
            // Process payment with external gateway (simulated for demo)
            boolean paymentSuccess = processWithGateway(payment, paymentDetails);
            
            if (paymentSuccess) {
                // Update payment status
                payment.setStatus(Payment.PaymentStatus.COMPLETED);
                payment.setTransactionId(UUID.randomUUID().toString());
                payment.setProcessedAt(LocalDateTime.now());
                paymentRepository.save(payment);
                
                // Update reservation status
                Reservation updated = reservationService.updatePaymentStatus(
                        reservationId, 
                        Reservation.PaymentStatus.PAID, 
                        payment.getTransactionId());
                
                log.info("Payment processed successfully for reservation {}, transaction ID: {}", 
                        reservationId, payment.getTransactionId());
                
                // Return success response
                result.put("success", true);
                result.put("paymentId", payment.getId());
                result.put("transactionId", payment.getTransactionId());
                result.put("amount", payment.getAmount());
                result.put("currency", payment.getCurrency());
                result.put("paymentMethod", payment.getPaymentMethod().name());
                result.put("reservationStatus", updated.getStatus().name());
                result.put("message", "Payment processed successfully");
            } else {
                // Handle payment failure
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setFailureReason("Payment processing failed");
                payment.setProcessedAt(LocalDateTime.now());
                paymentRepository.save(payment);
                
                log.warn("Payment failed for reservation {}", reservationId);
                
                result.put("success", false);
                result.put("paymentId", payment.getId());
                result.put("message", "Payment processing failed");
            }
            
            return result;
        } catch (Exception e) {
            log.error("Error processing payment for reservation {}: {}", reservationId, e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Payment processing error: " + e.getMessage());
            return result;
        }
    }
      /**
     * Refund a payment for a reservation with full Payment entity integration
     * @param reservationId the ID of the reservation to refund
     * @return refund result with status
     */
    @Transactional
    public Map<String, Object> refundPayment(Long reservationId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Get the reservation
            Reservation reservation = reservationService.getReservation(reservationId)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
            
            // Check if payment can be refunded
            if (reservation.getPaymentStatus() != Reservation.PaymentStatus.PAID) {
                result.put("success", false);
                result.put("message", "No payment to refund");
                return result;
            }
            
            // Find the original payment
            List<Payment> payments = paymentRepository.findByReservationIdAndStatus(
                    reservationId, Payment.PaymentStatus.COMPLETED);
            
            if (payments.isEmpty()) {
                result.put("success", false);
                result.put("message", "No completed payment found for refund");
                return result;
            }
            
            Payment originalPayment = payments.get(0); // Get the first completed payment
            
            // Create refund payment record
            Payment refundPayment = new Payment();
            refundPayment.setReservation(reservation);
            refundPayment.setAmount(originalPayment.getAmount().negate()); // Negative amount for refund
            refundPayment.setCurrency(originalPayment.getCurrency());
            refundPayment.setPaymentMethod(originalPayment.getPaymentMethod());
            refundPayment.setStatus(Payment.PaymentStatus.PROCESSING);
            refundPayment.setPaymentProcessor(originalPayment.getPaymentProcessor());
            refundPayment.setCreatedAt(LocalDateTime.now());
            
            // Save refund payment record
            refundPayment = paymentRepository.save(refundPayment);
            
            // Process refund with external gateway (simulated for demo)
            boolean refundSuccess = processRefundWithGateway(originalPayment, refundPayment);
            
            if (refundSuccess) {
                // Update refund payment status
                refundPayment.setStatus(Payment.PaymentStatus.COMPLETED);
                refundPayment.setTransactionId(UUID.randomUUID().toString());
                refundPayment.setProcessedAt(LocalDateTime.now());
                paymentRepository.save(refundPayment);
                
                // Update original payment status
                originalPayment.setStatus(Payment.PaymentStatus.REFUNDED);
                originalPayment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(originalPayment);
                
                // Update reservation status
                Reservation updated = reservationService.updatePaymentStatus(
                        reservationId, 
                        Reservation.PaymentStatus.REFUNDED, 
                        null);
                
                log.info("Refund processed successfully for reservation {}, refund transaction ID: {}", 
                        reservationId, refundPayment.getTransactionId());
                
                // Return success response
                result.put("success", true);
                result.put("refundId", refundPayment.getId());
                result.put("refundTransactionId", refundPayment.getTransactionId());
                result.put("refundAmount", refundPayment.getAmount().abs());
                result.put("currency", refundPayment.getCurrency());
                result.put("message", "Refund processed successfully");
            } else {
                // Handle refund failure
                refundPayment.setStatus(Payment.PaymentStatus.FAILED);
                refundPayment.setFailureReason("Refund processing failed");
                refundPayment.setProcessedAt(LocalDateTime.now());
                paymentRepository.save(refundPayment);
                
                log.warn("Refund failed for reservation {}", reservationId);
                
                result.put("success", false);
                result.put("refundId", refundPayment.getId());
                result.put("message", "Refund processing failed");
            }
            
            return result;
        } catch (Exception e) {
            log.error("Error processing refund for reservation {}: {}", reservationId, e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Refund processing error: " + e.getMessage());
            return result;
        }
    }
    
    /**
     * Get payment history for a reservation
     */
    public List<Payment> getPaymentHistory(Long reservationId) {
        return paymentRepository.findByReservationId(reservationId);
    }
    
    /**
     * Get payment by transaction ID
     */
    public Optional<Payment> getPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId);
    }
    
    /**
     * Get payment analytics for a date range
     */
    public Map<String, Object> getPaymentAnalytics(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> analytics = new HashMap<>();
        
        BigDecimal totalPayments = paymentRepository.getTotalPaymentsForPeriod(startDate, endDate);
        Long pendingCount = paymentRepository.countByStatus(Payment.PaymentStatus.PENDING);
        Long completedCount = paymentRepository.countByStatus(Payment.PaymentStatus.COMPLETED);
        Long failedCount = paymentRepository.countByStatus(Payment.PaymentStatus.FAILED);
        
        analytics.put("totalPayments", totalPayments != null ? totalPayments : BigDecimal.ZERO);
        analytics.put("pendingCount", pendingCount);
        analytics.put("completedCount", completedCount);
        analytics.put("failedCount", failedCount);
        analytics.put("successRate", 
                completedCount > 0 && failedCount > 0 ? 
                completedCount.doubleValue() / (completedCount + failedCount) * 100 : 0.0);
        
        return analytics;
    }
    
    /**
     * Process pending payments that are stuck
     */
    @Transactional
    public int processPendingPayments() {
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(1); // 1 hour timeout
        List<Payment> pendingPayments = paymentRepository.findPendingPaymentsOlderThan(cutoffTime);
        
        int processedCount = 0;
        for (Payment payment : pendingPayments) {
            try {
                // Mark as failed if pending too long
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setFailureReason("Payment timeout - processing took too long");
                payment.setProcessedAt(LocalDateTime.now());
                paymentRepository.save(payment);
                
                log.warn("Marked payment {} as failed due to timeout", payment.getId());
                processedCount++;
            } catch (Exception e) {
                log.error("Error processing pending payment {}: {}", payment.getId(), e.getMessage());
            }
        }
        
        return processedCount;
    }
    
    /**
     * Partial refund for a payment
     */
    @Transactional
    public Map<String, Object> partialRefund(Long reservationId, BigDecimal refundAmount) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Get the reservation
            Reservation reservation = reservationService.getReservation(reservationId)
                    .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
            
            // Find the original payment
            List<Payment> payments = paymentRepository.findByReservationIdAndStatus(
                    reservationId, Payment.PaymentStatus.COMPLETED);
            
            if (payments.isEmpty()) {
                result.put("success", false);
                result.put("message", "No completed payment found for refund");
                return result;
            }
            
            Payment originalPayment = payments.get(0);
            
            // Validate refund amount
            if (refundAmount.compareTo(originalPayment.getAmount()) > 0) {
                result.put("success", false);
                result.put("message", "Refund amount cannot exceed original payment amount");
                return result;
            }
            
            // Create partial refund payment record
            Payment refundPayment = new Payment();
            refundPayment.setReservation(reservation);
            refundPayment.setAmount(refundAmount.negate()); // Negative amount for refund
            refundPayment.setCurrency(originalPayment.getCurrency());
            refundPayment.setPaymentMethod(originalPayment.getPaymentMethod());
            refundPayment.setStatus(Payment.PaymentStatus.PROCESSING);
            refundPayment.setPaymentProcessor(originalPayment.getPaymentProcessor());
            refundPayment.setCreatedAt(LocalDateTime.now());
            
            // Save partial refund payment record
            refundPayment = paymentRepository.save(refundPayment);
            
            // Process partial refund
            boolean refundSuccess = processRefundWithGateway(originalPayment, refundPayment);
            
            if (refundSuccess) {
                refundPayment.setStatus(Payment.PaymentStatus.COMPLETED);
                refundPayment.setTransactionId(UUID.randomUUID().toString());
                refundPayment.setProcessedAt(LocalDateTime.now());
                paymentRepository.save(refundPayment);
                
                // Update original payment status to partially refunded
                originalPayment.setStatus(Payment.PaymentStatus.PARTIALLY_REFUNDED);
                originalPayment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(originalPayment);
                
                log.info("Partial refund processed for reservation {}, amount: {}", 
                        reservationId, refundAmount);
                
                result.put("success", true);
                result.put("refundId", refundPayment.getId());
                result.put("refundTransactionId", refundPayment.getTransactionId());
                result.put("refundAmount", refundAmount);
                result.put("currency", refundPayment.getCurrency());
                result.put("message", "Partial refund processed successfully");
            } else {
                refundPayment.setStatus(Payment.PaymentStatus.FAILED);
                refundPayment.setFailureReason("Partial refund processing failed");
                refundPayment.setProcessedAt(LocalDateTime.now());
                paymentRepository.save(refundPayment);
                
                result.put("success", false);
                result.put("message", "Partial refund processing failed");
            }
            
            return result;
        } catch (Exception e) {
            log.error("Error processing partial refund for reservation {}: {}", reservationId, e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Partial refund processing error: " + e.getMessage());
            return result;
        }
    }
    
    // Private helper methods
    
    /**
     * Determine payment processor based on payment method
     */
    private String determinePaymentProcessor(String paymentMethod) {
        switch (paymentMethod.toUpperCase()) {
            case "CREDIT_CARD":
            case "DEBIT_CARD":
                return "STRIPE"; // Default card processor
            case "PAYPAL":
                return "PAYPAL";
            case "BANK_TRANSFER":
                return "BANK_GATEWAY";
            case "CRYPTO":
                return "CRYPTO_GATEWAY";
            default:
                return "DEFAULT_PROCESSOR";
        }
    }
    
    /**
     * Simulate payment processing with external gateway
     * In production, this would integrate with actual payment processors
     */
    private boolean processWithGateway(Payment payment, Map<String, String> paymentDetails) {
        try {
            // Simulate processing time
            Thread.sleep(1000);
            
            // Simulate success/failure (90% success rate for demo)
            return Math.random() > 0.1;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
    
    /**
     * Simulate refund processing with external gateway
     * In production, this would integrate with actual payment processors
     */
    private boolean processRefundWithGateway(Payment originalPayment, Payment refundPayment) {
        try {
            // Simulate processing time
            Thread.sleep(500);
            
            // Simulate success/failure (95% success rate for refunds)
            return Math.random() > 0.05;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }
}