package com.ptit.notificationservice.dto;

import java.sql.Timestamp;
import java.util.UUID;

public class NotificationTemplateResponse {
    private UUID templateId;
    private String eventType;
    private String emailSubjectTemplate;
    private String emailBodyTemplate;
    private String inappBodyTemplate;
    private Boolean isDeleted;
    private Timestamp createdAt;

    // Getters and setters
    public UUID getTemplateId() {
        return templateId;
    }

    public void setTemplateId(UUID templateId) {
        this.templateId = templateId;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getEmailSubjectTemplate() {
        return emailSubjectTemplate;
    }

    public void setEmailSubjectTemplate(String emailSubjectTemplate) {
        this.emailSubjectTemplate = emailSubjectTemplate;
    }

    public String getEmailBodyTemplate() {
        return emailBodyTemplate;
    }

    public void setEmailBodyTemplate(String emailBodyTemplate) {
        this.emailBodyTemplate = emailBodyTemplate;
    }

    public String getInappBodyTemplate() {
        return inappBodyTemplate;
    }

    public void setInappBodyTemplate(String inappBodyTemplate) {
        this.inappBodyTemplate = inappBodyTemplate;
    }

    public Boolean getIsDeleted() {
        return isDeleted;
    }

    public void setIsDeleted(Boolean isDeleted) {
        this.isDeleted = isDeleted;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
