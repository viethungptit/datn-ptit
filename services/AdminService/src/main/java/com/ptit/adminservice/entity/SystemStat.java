package com.ptit.adminservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.sql.Timestamp;
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

    @Column(name = "total_admins", nullable = false)
    private int totalAdmins;

    @Column(name = "total_candidates", nullable = false)
    private int totalCandidates;

    @Column(name = "total_employers", nullable = false)
    private int totalEmployers;

    @Column(name = "total_companies", nullable = false)
    private int totalCompanies;

    @Column(name = "total_applies", nullable = false)
    private int totalApplies;

    @Column(name = "total_jobs", nullable = false)
    private int totalJobs;

    @Column(name = "active_jobs", nullable = false)
    private int activeJobs;

    @Column(name = "avg_match_score", nullable = false)
    private float avgMatchScore;

    @Column(name = "collected_at", nullable = false)
    private Instant collectedAt = Instant.now();

    public Instant getCollectedAt() {
        return collectedAt;
    }

    public float getAvgMatchScore() {
        return avgMatchScore;
    }

    public void setAvgMatchScore(float avgMatchScore) {
        this.avgMatchScore = avgMatchScore;
    }

    public int getActiveJobs() {
        return activeJobs;
    }

    public void setActiveJobs(int activeJobs) {
        this.activeJobs = activeJobs;
    }

    public int getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(int totalJobs) {
        this.totalJobs = totalJobs;
    }

    public int getTotalApplies() {
        return totalApplies;
    }

    public void setTotalApplies(int totalApplies) {
        this.totalApplies = totalApplies;
    }

    public int getTotalCompanies() {
        return totalCompanies;
    }

    public void setTotalCompanies(int totalCompanies) {
        this.totalCompanies = totalCompanies;
    }

    public int getTotalEmployers() {
        return totalEmployers;
    }

    public void setTotalEmployers(int totalEmployers) {
        this.totalEmployers = totalEmployers;
    }

    public int getTotalCandidates() {
        return totalCandidates;
    }

    public void setTotalCandidates(int totalCandidates) {
        this.totalCandidates = totalCandidates;
    }

    public int getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(int totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public UUID getStatId() {
        return statId;
    }

    public void setStatId(UUID statId) {
        this.statId = statId;
    }
}
