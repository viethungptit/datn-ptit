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
@Table(name = "system_health")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemHealth {
    @Id
    @Column(name = "service_name", nullable = false)
    private String serviceName;

    @Column(nullable = false)
    private String status;

    private Instant lastHeartbeat;
    private Float cpuUsage;
    private Float memoryUsage;
}

