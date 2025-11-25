package com.ptit.recruitservice.dto;

import java.util.UUID;
import java.sql.Timestamp;

public class ApplicationResponse {
    private UUID applicationId;
    private UUID jobId;
    private UUID cvId;
    private String status;
    private boolean isDeleted;
    private Timestamp appliedAt;
    private CVDto cv;
    private JobDto job;
    private CompanyResponse company;
    public CompanyResponse getCompany() {return company;}
    public void setCompany(CompanyResponse company) {this.company = company;}
    public JobDto getJob() {return job;}
    public void setJob(JobDto job) {this.job = job;}
    public UUID getApplicationId() { return applicationId; }
    public void setApplicationId(UUID applicationId) { this.applicationId = applicationId; }
    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }
    public UUID getCvId() { return cvId; }
    public void setCvId(UUID cvId) { this.cvId = cvId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public Timestamp getAppliedAt() { return appliedAt; }
    public void setAppliedAt(Timestamp appliedAt) { this.appliedAt = appliedAt; }

    public CVDto getCv() {
        return cv;
    }

    public void setCv(CVDto cv) {
        this.cv = cv;
    }
}

