package com.ptit.recruitservice.dto;

import java.util.UUID;
import java.sql.Timestamp;

public class FavoriteJobResponse {
    private UUID favoriteId;
    private UUID userId;
    private UUID jobId;
    private Timestamp createdAt;

    public UUID getFavoriteId() {
        return favoriteId;
    }
    public void setFavoriteId(UUID favoriteId) {
        this.favoriteId = favoriteId;
    }
    public UUID getUserId() {
        return userId;
    }
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    public UUID getJobId() {
        return jobId;
    }
    public void setJobId(UUID jobId) {
        this.jobId = jobId;
    }
    public Timestamp getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}

