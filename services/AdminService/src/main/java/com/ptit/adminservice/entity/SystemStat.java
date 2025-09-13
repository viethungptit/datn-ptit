package com.ptit.adminservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;
import java.time.Instant;

@Entity
@Table(name = "system_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemStat {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "stat_id", nullable = false, updatable = false)
    private UUID statId;

    @Column(name = "total_users", nullable = false)
    private int totalUsers;

    @Column(name = "total_candidates", nullable = false)
    private int totalCandidates;

    @Column(name = "total_employers", nullable = false)
    private int totalEmployers;

    @Column(name = "total_company", nullable = false)
    private int totalCompany;

    @Column(name = "total_apply", nullable = false)
    private int totalApply;

    @Column(name = "total_jobs", nullable = false)
    private int totalJobs;

    @Column(name = "active_jobs", nullable = false)
    private int activeJobs;

    @Column(name = "avg_match_score", nullable = false)
    private float avgMatchScore;

    @Column(name = "collected_at", nullable = false)
    private Instant collectedAt;
}
