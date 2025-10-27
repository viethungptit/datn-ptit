package com.ptit.notificationservice.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notification_templates")
public class NotificationTemplate {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "template_id", nullable = false, updatable = false)
    private UUID templateId;

    @Column(name = "event_type", unique = true)
    private String eventType;

    @Column(name = "email_subject_template", columnDefinition = "TEXT")
    private String emailSubjectTemplate;

    @Column(name = "email_body_template", columnDefinition = "TEXT")
    private String emailBodyTemplate;

    @Column(name = "inapp_body_template", columnDefinition = "TEXT")
    private String inappBodyTemplate;

    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @CreationTimestamp
    @Column(name = "created_at")
    private Timestamp createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "template")
    private List<Notification> notifications;

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

    public Boolean getDeleted() {
        return isDeleted;
    }

    public void setDeleted(Boolean deleted) {
        isDeleted = deleted;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public List<Notification> getNotifications() {
        return notifications;
    }

    public void setNotifications(List<Notification> notifications) {
        this.notifications = notifications;
    }
}
