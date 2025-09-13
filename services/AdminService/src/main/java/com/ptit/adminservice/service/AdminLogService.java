package com.ptit.adminservice.service;

import com.ptit.adminservice.dto.AdminLogDto;
import com.ptit.adminservice.dto.CreateAdminLogRequest;
import com.ptit.adminservice.entity.AdminLog;
import com.ptit.adminservice.repository.AdminLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminLogService {
    private final AdminLogRepository adminLogRepository;

    public Page<AdminLogDto> getLogs(int page, int size, String action, Instant start, Instant end) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AdminLog> logs;
        if (action != null && !action.isEmpty() && start != null && end != null) {
            logs = adminLogRepository.findByActionContainingAndCreatedAtBetween(action, start, end, pageable);
        } else if (action != null && !action.isEmpty()) {
            logs = adminLogRepository.findByActionContaining(action, pageable);
        } else if (start != null && end != null) {
            logs = adminLogRepository.findByCreatedAtBetween(start, end, pageable);
        } else {
            logs = adminLogRepository.findAll(pageable);
        }
        return logs.map(this::toDto);
    }

    public AdminLogDto createAdminLog(CreateAdminLogRequest request) {
        AdminLog log = AdminLog.builder()
                .userId(request.getUserId())
                .action(request.getAction())
                .details(request.getDetails())
                .createdAt(java.time.Instant.now())
                .build();
        log = adminLogRepository.save(log);
        return toDto(log);
    }

    private AdminLogDto toDto(AdminLog log) {
        AdminLogDto dto = new AdminLogDto();
        dto.setLogId(log.getLogId());
        dto.setUserId(log.getUserId());
        dto.setAction(log.getAction());
        dto.setDetails(log.getDetails());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}
