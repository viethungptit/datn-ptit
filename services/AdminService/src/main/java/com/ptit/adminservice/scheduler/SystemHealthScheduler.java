package com.ptit.adminservice.scheduler;

import com.ptit.adminservice.service.HealthCheckService;
import com.ptit.adminservice.service.SystemStatService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SystemHealthScheduler {

    private final HealthCheckService healthCheckService;
    private final SystemStatService systemStatService;

    @Scheduled(cron = "0 0 0 * * *")
    public void collectDailyStats() {
        systemStatService.collectAndSaveStats();
    }

    @Scheduled(fixedDelayString = "${health.check.interval}")
    public void runHealthCheck() {
        healthCheckService.checkAllServices();
    }
}

