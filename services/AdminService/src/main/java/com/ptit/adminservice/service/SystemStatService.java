package com.ptit.adminservice.service;

import com.ptit.adminservice.dto.CreateSystemStatRequest;
import com.ptit.adminservice.dto.SystemStatDto;
import com.ptit.adminservice.entity.SystemStat;
import com.ptit.adminservice.feign.RecommendServiceFeign;
import com.ptit.adminservice.feign.RecruitServiceFeign;
import com.ptit.adminservice.feign.UserServiceFeign;
import com.ptit.adminservice.repository.SystemStatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemStatService {
    private final SystemStatRepository systemStatRepository;


    @Autowired
    private UserServiceFeign userFeign;
    @Autowired private RecruitServiceFeign recruitFeign;
    @Autowired private RecommendServiceFeign recommendFeign;

    @Value("${internal.secret}")
    private String internalSecret;

    public SystemStatDto getLatestStat() {
        Optional<SystemStat> statOpt = systemStatRepository.findLatestStat();
        return statOpt.map(this::toDto).orElse(null);
    }

    public List<SystemStatDto> getAllStats() {
        return systemStatRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
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
        dto.setAvgMatchScore(stat.getAvgMatchScore());
        dto.setCollectedAt(stat.getCollectedAt());
        return dto;
    }



    public void collectAndSaveStats() {
        Map<String, Object> userStats = userFeign.getUserStats(internalSecret);
        Map<String, Object> recruitStats = recruitFeign.getRecruitStats(internalSecret);
        Map<String, Object> recommendStats = recommendFeign.getRecommendStats(internalSecret);

        SystemStat stats = new SystemStat();
        stats.setTotalAdmins((Integer) userStats.get("total_admins"));
        stats.setTotalCandidates((Integer) userStats.get("total_candidates"));
        stats.setTotalEmployers((Integer) userStats.get("total_employers"));
        stats.setTotalCompanies((Integer) userStats.get("total_companies"));
        stats.setTotalJobs((Integer) recruitStats.get("total_jobs"));
        stats.setActiveJobs((Integer) recruitStats.get("active_jobs"));
        stats.setTotalApplies((Integer) recruitStats.get("total_applies"));
        stats.setAvgMatchScore(Float.parseFloat(recommendStats.get("avg_match_score").toString()));
        systemStatRepository.save(stats);
    }
}
