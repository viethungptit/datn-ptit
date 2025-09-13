package com.ptit.adminservice.service;

import com.ptit.adminservice.dto.CreateSystemStatRequest;
import com.ptit.adminservice.dto.SystemStatDto;
import com.ptit.adminservice.entity.SystemStat;
import com.ptit.adminservice.repository.SystemStatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemStatService {
    private final SystemStatRepository systemStatRepository;

    public SystemStatDto getLatestStat() {
        Optional<SystemStat> statOpt = systemStatRepository.findLatestStat();
        return statOpt.map(this::toDto).orElse(null);
    }

    public List<SystemStatDto> getAllStats() {
        return systemStatRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public SystemStatDto createSystemStat(CreateSystemStatRequest request) {
        java.time.Instant collectedAt = request.getCollectedAt() != null ? java.time.Instant.ofEpochMilli(request.getCollectedAt()) : java.time.Instant.now();
        SystemStat stat = SystemStat.builder()
                .totalUsers(request.getTotalUsers())
                .totalCandidates(request.getTotalCandidates())
                .totalEmployers(request.getTotalEmployers())
                .totalJobs(request.getTotalJobs())
                .totalCompany(request.getTotalCompany())
                .totalApply(request.getTotalApply())
                .activeJobs(request.getActiveJobs())
                .avgMatchScore(request.getAvgMatchScore())
                .collectedAt(collectedAt)
                .build();
        stat = systemStatRepository.save(stat);
        return toDto(stat);
    }

    private SystemStatDto toDto(SystemStat stat) {
        SystemStatDto dto = new SystemStatDto();
        dto.setTotalUsers(stat.getTotalUsers());
        dto.setTotalCandidates(stat.getTotalCandidates());
        dto.setTotalEmployers(stat.getTotalEmployers());
        dto.setTotalJobs(stat.getTotalJobs());
        dto.setTotalCompany(stat.getTotalCompany());
        dto.setTotalApply(stat.getTotalApply());
        dto.setActiveJobs(stat.getActiveJobs());
        dto.setAvgMatchScore(stat.getAvgMatchScore());
        dto.setCollectedAt(stat.getCollectedAt());
        return dto;
    }
}
