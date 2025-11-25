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

    @Column(name = "open_jobs", nullable = false)
    private int openJobs;

    @Column(name = "pending_jobs", nullable = false)
    private int pendingJobs;

    @Column(name = "total_cvs", nullable = false)
    private int totalCvs;

    @Column(name = "approved_applies", nullable = false)
    private int approvedApplies;

    @Column(name = "rejected_applies", nullable = false)
    private int rejectedApplies;

    @Column(name = "pending_applies", nullable = false)
    private int pendingApplies;

    @Column(name = "job_tags_count", nullable = false)
    private int jobTagsCount;

    @Column(name = "group_job_tags_count", nullable = false)
    private int groupJobTagsCount;

    @Column(name = "email_deli_count", nullable = false)
    private int emailDeliCount;

    @Column(name = "email_pending_count", nullable = false)
    private int emailPendingCount;

    @Column(name = "email_success_count", nullable = false)
    private int emailSuccessCount;

    @Column(name = "email_fail_count", nullable = false)
    private int emailFailCount;

    @Column(name = "collected_at", nullable = false)
    private Instant collectedAt = Instant.now();

    public Instant getCollectedAt() {
        return collectedAt;
    }

    public int getActiveJobs() {
        return openJobs;
    }

    public void setActiveJobs(int openJobs) {
        this.openJobs = openJobs;
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

    public int getOpenJobs() {
        return openJobs;
    }

    public void setOpenJobs(int openJobs) {
        this.openJobs = openJobs;
    }

    public int getPendingJobs() {
        return pendingJobs;
    }

    public void setPendingJobs(int pendingJobs) {
        this.pendingJobs = pendingJobs;
    }

    public int getTotalCvs() {
        return totalCvs;
    }

    public void setTotalCvs(int totalCvs) {
        this.totalCvs = totalCvs;
    }

    public int getApprovedApplies() {
        return approvedApplies;
    }

    public void setApprovedApplies(int approvedApplies) {
        this.approvedApplies = approvedApplies;
    }

    public int getRejectedApplies() {
        return rejectedApplies;
    }

    public void setRejectedApplies(int rejectedApplies) {
        this.rejectedApplies = rejectedApplies;
    }

    public int getPendingApplies() {
        return pendingApplies;
    }

    public void setPendingApplies(int pendingApplies) {
        this.pendingApplies = pendingApplies;
    }

    public int getJobTagsCount() {
        return jobTagsCount;
    }

    public void setJobTagsCount(int jobTagsCount) {
        this.jobTagsCount = jobTagsCount;
    }

    public int getGroupJobTagsCount() {
        return groupJobTagsCount;
    }

    public void setGroupJobTagsCount(int groupJobTagsCount) {
        this.groupJobTagsCount = groupJobTagsCount;
    }

    public UUID getStatId() {
        return statId;
    }

    public void setStatId(UUID statId) {
        this.statId = statId;
    }

    public int getEmailDeliCount() {
        return emailDeliCount;
    }

    public void setEmailDeliCount(int emailDeliCount) {
        this.emailDeliCount = emailDeliCount;
    }

    public int getEmailPendingCount() {
        return emailPendingCount;
    }

    public void setEmailPendingCount(int emailPendingCount) {
        this.emailPendingCount = emailPendingCount;
    }

    public int getEmailSuccessCount() {
        return emailSuccessCount;
    }

    public void setEmailSuccessCount(int emailSuccessCount) {
        this.emailSuccessCount = emailSuccessCount;
    }

    public int getEmailFailCount() {
        return emailFailCount;
    }

    public void setEmailFailCount(int emailFailCount) {
        this.emailFailCount = emailFailCount;
    }

    public void setCollectedAt(Instant collectedAt) {
        this.collectedAt = collectedAt;
    }
}
