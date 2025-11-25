package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.entity.Application;
import com.ptit.recruitservice.entity.Job;
import com.ptit.recruitservice.repository.ApplicationRepository;
import com.ptit.recruitservice.repository.CVRepository;
import com.ptit.recruitservice.repository.GroupJobTagRepository;
import com.ptit.recruitservice.repository.JobRepository;
import com.ptit.recruitservice.repository.JobTagRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.HealthEndpoint;
import org.springframework.boot.actuate.metrics.MetricsEndpoint;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/recruit-service/health")
public class HealthController {

    private final HealthEndpoint healthEndpoint;
    private final MetricsEndpoint metricsEndpoint;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CVRepository cvRepository;
    private final JobTagRepository jobTagRepository;
    private final GroupJobTagRepository groupJobTagRepository;

    @Value("${internal.secret}")
    private String internalSecret;

    @Value("${spring.application.name:recruit-service}")
    private String serviceName;

    public HealthController(HealthEndpoint healthEndpoint, MetricsEndpoint metricsEndpoint,
                            JobRepository jobRepository, ApplicationRepository applicationRepository,
                            CVRepository cvRepository, JobTagRepository jobTagRepository,
                            GroupJobTagRepository groupJobTagRepository) {
        this.healthEndpoint = healthEndpoint;
        this.metricsEndpoint = metricsEndpoint;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.cvRepository = cvRepository;
        this.jobTagRepository = jobTagRepository;
        this.groupJobTagRepository = groupJobTagRepository;
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

    @GetMapping("/stats")
    public Map<String, Object> getRecruitStats(@RequestHeader(value = "X-Internal-Secret", required = false) String secret) {
        if (secret == null || !secret.equals(internalSecret)) {
            throw new AccessDeniedException("Bạn không có quyền truy cập tài nguyên này.");
        }

        long totalJobs = jobRepository.countByIsDeletedFalse();
        long activeJobs = jobRepository.countByStatusAndIsDeletedFalse(Job.Status.open);
        long pendingJobs = jobRepository.countByStatusAndIsDeletedFalse(Job.Status.pending);

        long totalApplies = applicationRepository.countByIsDeletedFalse();
        long approvedApplies = applicationRepository.countByStatusAndIsDeletedFalse(Application.Status.approved);
        long rejectedApplies = applicationRepository.countByStatusAndIsDeletedFalse(Application.Status.rejected);
        long pendingApplies = applicationRepository.countByStatusAndIsDeletedFalse(Application.Status.pending);

        long totalCvs = cvRepository.countByIsDeletedFalse();

        long jobTagsCount = jobTagRepository.countByIsDeletedFalse();
        long groupJobTagsCount = groupJobTagRepository.countByIsDeletedFalse();

        Map<String, Object> result = new HashMap<>();
        result.put("total_jobs", totalJobs);
        result.put("active_jobs", activeJobs);
        result.put("pending_jobs", pendingJobs);
        result.put("total_applies", totalApplies);
        result.put("approved_applies", approvedApplies);
        result.put("rejected_applies", rejectedApplies);
        result.put("pending_applies", pendingApplies);
        result.put("total_cvs", totalCvs);
        result.put("job_tags_count", jobTagsCount);
        result.put("group_job_tags_count", groupJobTagsCount);
        return result;
    }
}
