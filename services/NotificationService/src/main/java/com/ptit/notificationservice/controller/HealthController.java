package com.ptit.notificationservice.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.metrics.MetricsEndpoint;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

import com.ptit.notificationservice.repository.EmailDeliveryRepository;
import com.ptit.notificationservice.entity.EmailDelivery;

@RestController
@RequestMapping("/api/notification-service/health")
public class HealthController {

    private final HealthEndpoint healthEndpoint;
    private final MetricsEndpoint metricsEndpoint;
    private final EmailDeliveryRepository emailDeliveryRepository;

    @Value("${internal.secret}")
    private String internalSecret;

    @Value("${spring.application.name:notification-service}")
    private String serviceName;

    public HealthController(HealthEndpoint healthEndpoint, MetricsEndpoint metricsEndpoint, EmailDeliveryRepository emailDeliveryRepository) {
        this.healthEndpoint = healthEndpoint;
        this.metricsEndpoint = metricsEndpoint;
        this.emailDeliveryRepository = emailDeliveryRepository;
    }

    @GetMapping
    public ResponseEntity<?> getSystemHealth(@RequestHeader(value = "X-Internal-Secret", required = false) String secret) {
        if (secret == null || !secret.equals(internalSecret)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập tài nguyên này.");
        }
        // 1. Trạng thái health (UP/DOWN)
        var health = healthEndpoint.health();
        String status = health.getStatus().getCode();

        // 2. CPU usage (0-1 → chuyển sang %)
        var cpuMetric = metricsEndpoint.metric("system.cpu.usage", null);
        double cpuUsage = 0.0;
        if (cpuMetric != null && !cpuMetric.getMeasurements().isEmpty()) {
            cpuUsage = cpuMetric.getMeasurements().get(0).getValue() * 100.0;
        }

        // 3. Memory usage (bytes → MB)
        var memoryMetric = metricsEndpoint.metric("jvm.memory.used", null);
        double memoryMB = 0.0;
        if (memoryMetric != null && !memoryMetric.getMeasurements().isEmpty()) {
            memoryMB = memoryMetric.getMeasurements().get(0).getValue() / (1024 * 1024);
        }

        Map<String, Object> response = Map.of(
                "service", serviceName,
                "status", status,
                "timestamp", Instant.now().toString(),
                "cpu", Math.round(cpuUsage * 10.0) / 10.0,
                "memory", Math.round(memoryMB)
        );
        return ResponseEntity.ok(response);
    }

    // New: return notification-service stats map used by other services
    @GetMapping("/stats")
    public Map<String, Object> getNotificationStats(@RequestHeader(value = "X-Internal-Secret", required = false) String secret) {
        if (secret == null || !secret.equals(internalSecret)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập tài nguyên này.");
        }

        long total = emailDeliveryRepository.count();
        long success = emailDeliveryRepository.countByStatus(EmailDelivery.EmailDeliveryStatus.success);
        long pending = emailDeliveryRepository.countByStatus(EmailDelivery.EmailDeliveryStatus.pending);
        long fail = emailDeliveryRepository.countByStatus(EmailDelivery.EmailDeliveryStatus.fail);

        return Map.of(
                "email_deli_count", total,
                "email_success_count", success,
                "email_pending_count", pending,
                "email_fail_count", fail
        );
    }
}
