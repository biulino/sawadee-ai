package com.canermastan.hotel.repository;

import com.canermastan.hotel.entity.ServiceShortcut;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceShortcutRepository extends JpaRepository<ServiceShortcut, Long> {
    
    List<ServiceShortcut> findByActiveOrderByDisplayOrder(Boolean active);
    
    List<ServiceShortcut> findAllByOrderByDisplayOrder();
}
