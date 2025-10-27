package com.ptit.notificationservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.sql.Timestamp;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "email_deliveries")
public class EmailDelivery {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "email_deli_id", nullable = false, updatable = false)
    private UUID emailDeliId;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "notification_id")
    private Notification notification;

    @Column(name = "email")
    private String email;

    @Column(name = "subject", columnDefinition = "TEXT")
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EmailDeliveryStatus status;

    @Column(name = "sent_at", updatable = false)
    @org.hibernate.annotations.CreationTimestamp
    private Timestamp sentAt;

    public enum EmailDeliveryStatus {
        pending, success, fail
    }

    public UUID getEmailDeliId() {
        return emailDeliId;
    }

    public void setEmailDeliId(UUID emailDeliId) {
        this.emailDeliId = emailDeliId;
    }

    public Notification getNotification() {
        return notification;
    }

    public void setNotification(Notification notification) {
        this.notification = notification;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public EmailDeliveryStatus getStatus() {
        return status;
    }

    public void setStatus(EmailDeliveryStatus status) {
        this.status = status;
    }

    public Timestamp getSentAt() {
        return sentAt;
    }

    public void setSentAt(Timestamp sentAt) {
        this.sentAt = sentAt;
    }
}
