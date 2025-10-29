package com.ptit.adminservice.repository;

import com.ptit.adminservice.entity.AdminAlertRecipient;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AdminAlertRecipientRepository extends JpaRepository<AdminAlertRecipient, UUID> {}