package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.ReportHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ReportHistoryRepository extends JpaRepository<ReportHistory, UUID> {
    Page<ReportHistory> findByUserId(UUID userId, Pageable pageable);
}
