package com.ptit.adminservice.feign;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "notificationServiceClient", url = "${external.notification.service.url}")
public interface NotificationServiceFeign {
    @GetMapping("/api/notification-service/health")
    Map<String, Object> getHealthStatus(@RequestHeader("X-Internal-Secret") String secret);
}
