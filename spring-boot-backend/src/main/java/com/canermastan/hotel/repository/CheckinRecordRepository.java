package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.CheckinRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CheckinRecordRepository extends JpaRepository<CheckinRecord, Long> {
    
    List<CheckinRecord> findByReservationIdOrderByCreatedAtDesc(Long reservationId);
    
    Optional<CheckinRecord> findByReservationIdAndStatusIn(Long reservationId, List<CheckinRecord.CheckinStatus> statuses);
    
    List<CheckinRecord> findByStatus(CheckinRecord.CheckinStatus status);
    
    List<CheckinRecord> findByGuestEmail(String guestEmail);
}
