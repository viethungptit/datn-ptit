package com.ptit.adminservice.repository;

import com.ptit.adminservice.entity.SystemStat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SystemStatRepository extends JpaRepository<SystemStat, UUID> {
    // Find latest stat by collectedAt
    Optional<SystemStat> findFirstByOrderByCollectedAtDesc();

    // Find all stats between start and end ordered by collectedAt desc
    List<SystemStat> findAllByCollectedAtBetweenOrderByCollectedAtDesc(Instant start, Instant end);

    // Find all stats after start (inclusive) ordered by collectedAt desc
    List<SystemStat> findAllByCollectedAtAfterOrderByCollectedAtDesc(Instant start);

    // Find all stats before end (inclusive) ordered by collectedAt desc
    List<SystemStat> findAllByCollectedAtBeforeOrderByCollectedAtDesc(Instant end);
}
