package com.ptit.recruitservice.dto;

import java.util.UUID;
import com.fasterxml.jackson.databind.JsonNode;
import java.sql.Timestamp;

public class CVDto {
    private UUID cvId;
    private UUID userId;
    private String sourceType;
    private UUID templateId;
    private JsonNode dataJson;
    private String fileUrl;
    private String title;
    private String status;
    private boolean isDeleted;
    private Timestamp createdAt;

    public UUID getCvId() { return cvId; }
    public void setCvId(UUID cvId) { this.cvId = cvId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getSourceType() { return sourceType; }
    public void setSourceType(String sourceType) { this.sourceType = sourceType; }
    public UUID getTemplateId() { return templateId; }
    public void setTemplateId(UUID templateId) { this.templateId = templateId; }
    public JsonNode getDataJson() { return dataJson; }
    public void setDataJson(JsonNode dataJson) { this.dataJson = dataJson; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
