package com.ptit.notificationservice.repository;

import com.ptit.notificationservice.entity.InappDelivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface InappDeliveryRepository extends JpaRepository<InappDelivery, UUID> {
    List<InappDelivery> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId);
    List<InappDelivery> findByUserId(UUID userId);
}
