package com.ptit.adminservice.service;

import com.ptit.adminservice.dto.CreateSystemStatRequest;
import com.ptit.adminservice.dto.SystemStatDto;
import com.ptit.adminservice.entity.SystemStat;
import com.ptit.adminservice.feign.NotificationServiceFeign;
import com.ptit.adminservice.feign.RecommendServiceFeign;
import com.ptit.adminservice.feign.RecruitServiceFeign;
import com.ptit.adminservice.feign.UserServiceFeign;
import com.ptit.adminservice.repository.SystemStatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemStatService {
    private final SystemStatRepository systemStatRepository;


    @Autowired private UserServiceFeign userFeign;
    @Autowired private RecruitServiceFeign recruitFeign;
    @Autowired private NotificationServiceFeign notificationFeign;

    @Value("${internal.secret}")
    private String internalSecret;

    public SystemStatDto getLatestStat() {
        Optional<SystemStat> statOpt = systemStatRepository.findFirstByOrderByCollectedAtDesc();
        return statOpt.map(this::toDto).orElse(null);
    }

    public List<SystemStatDto> getAllStats() {
        return systemStatRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<SystemStatDto> getAllStats(Instant start, Instant end) {
        List<SystemStat> stats;
        if (start != null && end != null) {
            stats = systemStatRepository.findAllByCollectedAtBetweenOrderByCollectedAtDesc(start, end);
        } else if (start != null) {
            stats = systemStatRepository.findAllByCollectedAtAfterOrderByCollectedAtDesc(start);
        } else if (end != null) {
            stats = systemStatRepository.findAllByCollectedAtBeforeOrderByCollectedAtDesc(end);
        } else {
            stats = systemStatRepository.findAll();
        }
        return stats.stream().map(this::toDto).collect(Collectors.toList());
    }

    private SystemStatDto toDto(SystemStat stat) {
        SystemStatDto dto = new SystemStatDto();
        dto.setTotalAdmins(stat.getTotalAdmins());
        dto.setTotalCandidates(stat.getTotalCandidates());
        dto.setTotalEmployers(stat.getTotalEmployers());
        dto.setTotalJobs(stat.getTotalJobs());
        dto.setTotalCompanies(stat.getTotalCompanies());
        dto.setTotalApplies(stat.getTotalApplies());
        dto.setActiveJobs(stat.getActiveJobs());

        dto.setPendingJobs(stat.getPendingJobs());
        dto.setTotalCvs(stat.getTotalCvs());
        dto.setApprovedApplies(stat.getApprovedApplies());
        dto.setRejectedApplies(stat.getRejectedApplies());
        dto.setPendingApplies(stat.getPendingApplies());
        dto.setJobTagsCount(stat.getJobTagsCount());
        dto.setGroupJobTagsCount(stat.getGroupJobTagsCount());
        dto.setEmailDeliCount(stat.getEmailDeliCount());
        dto.setEmailSuccessCount(stat.getEmailSuccessCount());
        dto.setEmailPendingCount(stat.getEmailPendingCount());
        dto.setEmailFailCount(stat.getEmailFailCount());
        dto.setCollectedAt(stat.getCollectedAt());
        return dto;
    }



    public void collectAndSaveStats() {
        Map<String, Object> userStats = userFeign.getUserStats(internalSecret);
        Map<String, Object> recruitStats = recruitFeign.getRecruitStats(internalSecret);
        Map<String, Object> notificationStats = notificationFeign.getNotificationStats(internalSecret);

        SystemStat stats = new SystemStat();

        stats.setTotalAdmins(((Number) userStats.getOrDefault("total_admins", 0)).intValue());
        stats.setTotalCandidates(((Number) userStats.getOrDefault("total_candidates", 0)).intValue());
        stats.setTotalEmployers(((Number) userStats.getOrDefault("total_employers", 0)).intValue());
        stats.setTotalCompanies(((Number) userStats.getOrDefault("total_companies", 0)).intValue());
        stats.setTotalJobs(((Number) recruitStats.getOrDefault("total_jobs", 0)).intValue());
        stats.setActiveJobs(((Number) recruitStats.getOrDefault("active_jobs", 0)).intValue());
        stats.setPendingJobs(((Number) recruitStats.getOrDefault("pending_jobs", 0)).intValue());
        stats.setTotalApplies(((Number) recruitStats.getOrDefault("total_applies", 0)).intValue());
        stats.setTotalCvs(((Number) recruitStats.getOrDefault("total_cvs", 0)).intValue());
        stats.setApprovedApplies(((Number) recruitStats.getOrDefault("approved_applies", 0)).intValue());
        stats.setRejectedApplies(((Number) recruitStats.getOrDefault("rejected_applies", 0)).intValue());
        stats.setPendingApplies(((Number) recruitStats.getOrDefault("pending_applies", 0)).intValue());
        stats.setJobTagsCount(((Number) recruitStats.getOrDefault("job_tags_count", 0)).intValue());
        stats.setGroupJobTagsCount(((Number) recruitStats.getOrDefault("group_job_tags_count", 0)).intValue());
        stats.setEmailDeliCount(((Number) notificationStats.getOrDefault("email_deli_count", 0)).intValue());
        stats.setEmailSuccessCount(((Number) notificationStats.getOrDefault("email_success_count", 0)).intValue());
        stats.setEmailPendingCount(((Number) notificationStats.getOrDefault("email_pending_count", 0)).intValue());
        stats.setEmailFailCount(((Number) notificationStats.getOrDefault("email_fail_count", 0)).intValue());
        stats.setCollectedAt(Instant.now());
        systemStatRepository.save(stats);
    }
}
