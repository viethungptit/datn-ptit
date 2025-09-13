package com.ptit.recruitservice.dto;

import java.util.UUID;

public class JobGroupTagMappingCreateRequest {
    private UUID groupTagId;
    private UUID jobId;

    public UUID getGroupTagId() { return groupTagId; }
    public void setGroupTagId(UUID groupTagId) { this.groupTagId = groupTagId; }
    public UUID getJobId() { return jobId; }
    public void setJobId(UUID jobId) { this.jobId = jobId; }
}

