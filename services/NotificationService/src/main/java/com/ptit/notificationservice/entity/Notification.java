package com.ptit.notificationservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.sql.Timestamp;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "notification_id", nullable = false, updatable = false)
    private UUID notificationId;

    @Column(name = "user_id")
    private UUID userId;

    @ManyToOne
    @JoinColumn(name = "template_id")
    private NotificationTemplate template;

    @Column(name = "event_type")
    private String eventType;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "payload", columnDefinition = "json")
    private String payload;

    @Column(name = "created_at", updatable = false)
    @org.hibernate.annotations.CreationTimestamp
    private Timestamp createdAt;

    @JsonIgnore
    @OneToMany(mappedBy = "notification")
    private List<EmailDelivery> emailDeliveries;

    @JsonIgnore
    @OneToMany(mappedBy = "notification")
    private List<InappDelivery> inappDeliveries;

    public UUID getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(UUID notificationId) {
        this.notificationId = notificationId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public NotificationTemplate getTemplate() {
        return template;
    }

    public void setTemplate(NotificationTemplate template) {
        this.template = template;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getPayload() {
        return payload;
    }

    public void setPayload(String payload) {
        this.payload = payload;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public List<EmailDelivery> getEmailDeliveries() {
        return emailDeliveries;
    }

    public void setEmailDeliveries(List<EmailDelivery> emailDeliveries) {
        this.emailDeliveries = emailDeliveries;
    }

    public List<InappDelivery> getInappDeliveries() {
        return inappDeliveries;
    }

    public void setInappDeliveries(List<InappDelivery> inappDeliveries) {
        this.inappDeliveries = inappDeliveries;
    }
}
