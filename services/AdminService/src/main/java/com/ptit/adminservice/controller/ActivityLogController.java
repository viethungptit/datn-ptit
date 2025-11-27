package com.ptit.adminservice.controller;

import com.ptit.adminservice.entity.ActivityLog;
import com.ptit.adminservice.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin-service/logs")
@RequiredArgsConstructor
public class ActivityLogController {
    private final ActivityLogService adminLogService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAllActivityLogs() {
        List<ActivityLog> logs = adminLogService.getAllLogs();
        return ResponseEntity.ok(logs);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/paged")
    public ResponseEntity<Page<ActivityLog>> getAllActivityLogsWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ActivityLog> result;
        result = adminLogService.getAllActivityLogsWithPagination(pageable);
        return ResponseEntity.ok(result);
    }
}
