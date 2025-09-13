package com.ptit.recruitservice.dto;

import java.util.UUID;

public class JobTagMappingCreateRequest {
    private UUID jobTagId;
    private UUID jobId;

    public UUID getJobTagId() { return jobTagId; }
    public void setJobTagId(UUID jobTagId) { this.jobTagId = jobTagId; }
    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }
}
