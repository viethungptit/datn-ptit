package com.ptit.adminservice.repository;

import com.ptit.adminservice.entity.SystemStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.Optional;
import java.util.UUID;

public interface SystemStatRepository extends JpaRepository<SystemStat, UUID> {
    @Query("SELECT s FROM SystemStat s ORDER BY s.collectedAt DESC LIMIT 1")
    Optional<SystemStat> findLatestStat();
}
