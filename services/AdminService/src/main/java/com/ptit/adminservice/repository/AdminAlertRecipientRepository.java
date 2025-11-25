package com.ptit.adminservice.repository;

import com.ptit.adminservice.entity.AdminAlertRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface AdminAlertRecipientRepository extends JpaRepository<AdminAlertRecipient, UUID> {
    @Modifying
    @Query(value = "TRUNCATE TABLE admin_alert_recipients RESTART IDENTITY CASCADE", nativeQuery = true)
    void truncateAll();
}