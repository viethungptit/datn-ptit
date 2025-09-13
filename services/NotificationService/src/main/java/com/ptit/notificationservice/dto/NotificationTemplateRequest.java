package com.ptit.notificationservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class NotificationTemplateRequest {
    @NotBlank
    @Size(max = 100)
    private String eventType;
    private String emailSubjectTemplate;
    private String emailBodyTemplate;
    private String inappBodyTemplate;

    // Getters and setters
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
}
