package com.ptit.adminservice.service;

import com.ptit.adminservice.dto.CreateActivityLogRequest;
import com.ptit.adminservice.entity.ActivityLog;
import com.ptit.adminservice.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public void createLog(CreateActivityLogRequest req) {
        ActivityLog log = ActivityLog.builder()
                .actorId(req.getActorId())
                .actorRole(req.getActorRole())
                .action(req.getAction())
                .targetType(req.getTargetType())
                .targetId(req.getTargetId())
                .description(req.getDescription())
                .createdAt(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
    }

    public List<ActivityLog> getAllLogs() {
        return activityLogRepository.findAll();
    }

    public Page<ActivityLog> getAllActivityLogsWithPagination(Pageable pageable) {
        return activityLogRepository.findAll(pageable);
    }
}
