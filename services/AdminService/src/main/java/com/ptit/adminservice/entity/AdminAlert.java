package com.ptit.adminservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "admin_alerts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAlert {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID alertId;

    private String type;
    private String severity; // INFO, WARNING, CRITICAL
    private String message;

    private boolean resolved = false;
    private Instant createdAt = Instant.now();
}
