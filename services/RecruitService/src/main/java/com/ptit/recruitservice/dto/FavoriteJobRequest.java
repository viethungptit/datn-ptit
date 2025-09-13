package com.ptit.recruitservice.dto;

import java.util.UUID;

public class FavoriteJobRequest {
    private UUID jobId;

    public UUID getJobId() {
        return jobId;
    }
    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }
}
