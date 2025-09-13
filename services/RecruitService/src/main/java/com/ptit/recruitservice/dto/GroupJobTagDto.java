package com.ptit.recruitservice.dto;

import java.util.UUID;

public class GroupJobTagDto {
    private UUID groupTagId;
    private String groupJobName;
    private Boolean isDeleted;

    // Getters and setters
    public UUID getGroupTagId() { return groupTagId; }
    public void setGroupTagId(UUID groupTagId) { this.groupTagId = groupTagId; }
    public String getGroupJobName() { return groupJobName; }
    public void setGroupJobName(String groupJobName) { this.groupJobName = groupJobName; }
    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }
}