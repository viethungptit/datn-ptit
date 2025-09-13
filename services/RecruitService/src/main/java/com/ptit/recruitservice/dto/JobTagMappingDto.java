package com.ptit.recruitservice.dto;

import java.util.UUID;

public class JobTagMappingDto {
    private UUID jtTagId;
    private UUID jobTagId;
    private UUID jobId;

    // Getters and setters
    public UUID getJtTagId() { return jtTagId; }
    public void setJtTagId(UUID jtTagId) { this.jtTagId = jtTagId; }
    public UUID getJobTagId() { return jobTagId; }
    public void setJobTagId(UUID jobTagId) { this.jobTagId = jobTagId; }
    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }
}


