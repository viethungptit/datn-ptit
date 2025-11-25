package com.ptit.notificationservice.repository;

import com.ptit.notificationservice.entity.EmailDelivery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface EmailDeliveryRepository extends JpaRepository<EmailDelivery, UUID> {
    long countByStatus(EmailDelivery.EmailDeliveryStatus status);
}
