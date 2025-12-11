package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByJob_JobIdAndCv_UserIdAndIsDeletedFalse(UUID jobId, UUID userId);
    List<Application> findByCv_UserIdAndIsDeletedFalse(UUID userId);

    // Count helpers for stats
    long countByIsDeletedFalse();
    long countByStatusAndIsDeletedFalse(Application.Status status);

    // Added for report queries
    long countByAppliedAtBetween(Timestamp start, Timestamp end);
    long countByStatusAndAppliedAtBetween(Application.Status status, Timestamp start, Timestamp end);
    Page<Application> findByAppliedAtBetween(Timestamp start, Timestamp end, Pageable pageable);

    // Per-job counts within time range
    long countByJob_JobIdAndAppliedAtBetween(UUID jobId, Timestamp start, Timestamp end);
    long countByJob_JobIdAndStatusAndAppliedAtBetween(UUID jobId, Application.Status status, Timestamp start, Timestamp end);
}
