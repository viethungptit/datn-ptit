package com.ptit.recruitservice.dto;

import java.util.UUID;

public class ApplicationRequest {
    private UUID jobId;
    private UUID cvId;

    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }
    public UUID getCvId() { return cvId; }
    public void setCvId(UUID cvId) { this.cvId = cvId; }
}
