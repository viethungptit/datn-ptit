package com.ptit.recruitservice.dto;

import java.util.UUID;

public class JobGroupTagMappingDto {
    private UUID jgTagId;
    private UUID groupTagId;
    private UUID jobId;

    // Getters and setters
    public UUID getJgTagId() { return jgTagId; }
    public void setJgTagId(UUID jgTagId) { this.jgTagId = jgTagId; }
    public UUID getGroupTagId() { return groupTagId; }
    public void setGroupTagId(UUID groupTagId) { this.groupTagId = groupTagId; }
    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }
}

