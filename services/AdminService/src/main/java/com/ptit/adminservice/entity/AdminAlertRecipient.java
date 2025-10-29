package com.ptit.adminservice.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "admin_alert_recipients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAlertRecipient {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "recipient_id", nullable = false, updatable = false)
    private UUID recipientId;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();
}

