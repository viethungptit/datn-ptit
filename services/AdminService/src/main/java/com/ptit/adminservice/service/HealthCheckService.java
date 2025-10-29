package com.ptit.adminservice.service;

import com.ptit.adminservice.config.EventPublisher;
import com.ptit.adminservice.entity.AdminAlert;
import com.ptit.adminservice.entity.SystemHealth;
import com.ptit.adminservice.feign.*;
import com.ptit.adminservice.repository.AdminAlertRepository;
import com.ptit.adminservice.repository.SystemHealthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.function.Supplier;

@Service
@RequiredArgsConstructor
public class HealthCheckService {

    private final SystemHealthRepository systemHealthRepository;
    private final AdminAlertRepository adminAlertRepository;
    private final AdminAlertRecipientService recipientService;
    private final EventPublisher eventPublisher;

    // Inject các Feign client
    private final UserServiceFeign userServiceFeign;
    private final RecruitServiceFeign recruitServiceFeign;
    private final RecommendServiceFeign recommendServiceFeign;
    private final NotificationServiceFeign notificationServiceFeign;

    @Value("${internal.secret}")
    private String internalSecret;

    @Value("${alert.exchange}")
    private String alertExchange;

    @Value("${alert.routing-key}")
    private String alertRoutingKey;

    /**
     * Gọi health check cho tất cả các service
     */
    public void checkAllServices() {
        Map<String, Supplier<Map<String, Object>>> serviceMap = Map.of(
                "user-service", () -> userServiceFeign.getHealthStatus(internalSecret),
                "recruit-service", () -> recruitServiceFeign.getHealthStatus(internalSecret),
                "recommend-service", () -> recommendServiceFeign.getHealthStatus(internalSecret),
                "notification-service", () -> notificationServiceFeign.getHealthStatus(internalSecret)
        );

        serviceMap.forEach((serviceName, fetcher) -> {
            try {
                checkService(serviceName, fetcher);
            } catch (Exception e) {
                handleAlert(serviceName, "DOWN", "CRITICAL", serviceName + " hiện không phản hồi!");
            }
        });
    }

    /**
     * Hàm check trạng thái 1 service cụ thể qua Feign client
     */
    private void checkService(String serviceName, Supplier<Map<String, Object>> fetcher) {
        String status = "DOWN";
        float cpu = 0f;
        float mem = 0f;

        try {
            Map<String, Object> body = fetcher.get();

            if (body != null) {
                status = String.valueOf(body.getOrDefault("status", "DOWN"));
                cpu = ((Number) body.getOrDefault("cpu", 0)).floatValue();
                mem = ((Number) body.getOrDefault("memory", 0)).floatValue();
            }
        } catch (Exception ex) {
            status = "DOWN";
        }

        // Lưu lịch sử health check vào DB
        systemHealthRepository.save(SystemHealth.builder()
                .serviceName(serviceName)
                .status(status)
                .lastHeartbeat(Instant.now())
                .cpuUsage(cpu)
                .memoryUsage(mem)
                .build());

        // Nếu DOWN → gửi cảnh báo
        if ("DOWN".equalsIgnoreCase(status)) {
            handleAlert(serviceName, "DOWN", "CRITICAL", serviceName + " hiện không phản hồi!");
        }
    }

    /**
     * Xử lý khi service bị DOWN → ghi DB + gửi sự kiện cảnh báo
     */
    private void handleAlert(String service, String type, String severity, String message) {
        // Lưu alert vào DB
        AdminAlert alert = adminAlertRepository.save(AdminAlert.builder()
                .type(type)
                .severity(severity)
                .message(message)
                .createdAt(Instant.now())
                .build());

        // Lấy danh sách người nhận cảnh báo
        List<String> recipients = recipientService.getAllRecipients().stream()
                .map(r -> r.getEmail())
                .toList();

        // Dữ liệu gửi đi qua RabbitMQ
        Map<String, Object> data = Map.of(
                "service", service,
                "type", type,
                "severity", severity,
                "message", message,
                "timestamp", alert.getCreatedAt().toString()
        );

        Map<String, Object> event = Map.of(
                "event_type", alertRoutingKey,
                "to", String.join(",", recipients),
                "data", data
        );

        eventPublisher.publish(alertExchange, alertRoutingKey, event);
    }
}
