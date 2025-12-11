package com.ptit.recruitservice.dto;

import java.sql.Timestamp;
import java.util.UUID;

public class ApplicantDTO {
    private UUID applicationId;
    private UUID cvId;
    private String candidateName;
    private UUID jobId;
    private String jobTitle;
    private String status;
    private Timestamp appliedAt;

    public ApplicantDTO(UUID applicationId, UUID cvId, String candidateName, UUID jobId, String jobTitle, String status, Timestamp appliedAt) {
        this.applicationId = applicationId;
        this.cvId = cvId;
        this.candidateName = candidateName;
        this.jobId = jobId;
        this.jobTitle = jobTitle;
        this.status = status;
        this.appliedAt = appliedAt;
    }

    public UUID getApplicationId() { return applicationId; }
    public UUID getCvId() { return cvId; }
    public String getCandidateName() { return candidateName; }
    public UUID getJobId() { return jobId; }
    public String getJobTitle() { return jobTitle; }
    public String getStatus() { return status; }
    public Timestamp getAppliedAt() { return appliedAt; }
}

