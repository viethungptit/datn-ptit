package com.ptit.adminservice.repository;

import com.ptit.adminservice.entity.AdminLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.UUID;

public interface AdminLogRepository extends JpaRepository<AdminLog, UUID> {
    Page<AdminLog> findByActionContainingAndCreatedAtBetween(String action, Instant start, Instant end, Pageable pageable);
    Page<AdminLog> findByCreatedAtBetween(Instant start, Instant end, Pageable pageable);
    Page<AdminLog> findByActionContaining(String action, Pageable pageable);
}

