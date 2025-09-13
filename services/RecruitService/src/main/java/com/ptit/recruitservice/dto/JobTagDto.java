package com.ptit.recruitservice.dto;

import java.util.UUID;

public class JobTagDto {
    private UUID jobTagId;
    private String jobName;
    private Boolean isDeleted;

    // Getters and setters
    public UUID getJobTagId() { return jobTagId; }
    public void setJobTagId(UUID jobTagId) { this.jobTagId = jobTagId; }
    public String getJobName() { return jobName; }
    public void setJobName(String jobName) { this.jobName = jobName; }
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
}

