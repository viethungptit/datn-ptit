package com.ptit.recruitservice.dto;

import java.util.UUID;
import com.fasterxml.jackson.databind.JsonNode;

public class CVUpdateRequest {
    private UUID templateId;
    private String title;
    private String dataJson;

    public UUID getTemplateId() { return templateId; }
    public void setTemplateId(UUID templateId) { this.templateId = templateId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDataJson() { return dataJson; }
    public void setDataJson(String dataJson) { this.dataJson = dataJson; }
}
