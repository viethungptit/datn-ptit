package com.ptit.recruitservice.repository;

import com.ptit.recruitservice.entity.FavoriteJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

public interface FavoriteJobRepository extends JpaRepository<FavoriteJob, UUID> {
    List<FavoriteJob> findByUserId(UUID userId);

    // For reports
    long countByJob_JobIdAndCreatedAtBetween(UUID jobId, Timestamp start, Timestamp end);
}
