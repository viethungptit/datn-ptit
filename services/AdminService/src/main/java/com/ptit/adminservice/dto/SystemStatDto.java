package com.ptit.adminservice.dto;
import lombok.Data;
import java.time.Instant;

@Data
public class SystemStatDto {
    private int totalAdmins;
    private int totalCandidates;
    private int totalEmployers;
    private int totalJobs;
    private int totalCompanies;
    private int totalApplies;
    private int activeJobs;
    private int pendingJobs;
    private int totalCvs;
    private int approvedApplies;
    private int rejectedApplies;
    private int pendingApplies;
    private int jobTagsCount;
    private int groupJobTagsCount;
    private int emailDeliCount;
    private int emailPendingCount;
    private int emailSuccessCount;
    private int emailFailCount;
    private Instant collectedAt;

    public int getTotalApplies() {
        return totalApplies;
    }

    public void setTotalApplies(int totalApplies) {
        this.totalApplies = totalApplies;
    }

    public int getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(int totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public int getTotalCandidates() {
        return totalCandidates;
    }

    public void setTotalCandidates(int totalCandidates) {
        this.totalCandidates = totalCandidates;
    }

    public int getTotalEmployers() {
        return totalEmployers;
    }

    public void setTotalEmployers(int totalEmployers) {
        this.totalEmployers = totalEmployers;
    }

    public int getTotalJobs() {
        return totalJobs;
    }

    public void setTotalJobs(int totalJobs) {
        this.totalJobs = totalJobs;
    }

    public int getTotalCompanies() {
        return totalCompanies;
    }

    public void setTotalCompanies(int totalCompanies) {
        this.totalCompanies = totalCompanies;
    }

    public int getActiveJobs() {
        return activeJobs;
    }

    public void setActiveJobs(int activeJobs) {
        this.activeJobs = activeJobs;
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

    public Instant getCollectedAt() {
        return collectedAt;
    }

    public void setCollectedAt(Instant collectedAt) {
        this.collectedAt = collectedAt;
    }
}


