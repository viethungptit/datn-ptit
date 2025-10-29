package com.ptit.adminservice.controller;

import com.ptit.adminservice.entity.ActivityLog;
import com.ptit.adminservice.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin-service/logs")
@RequiredArgsConstructor
public class ActivityLogController {
    private final ActivityLogService adminLogService;

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAllActivityLogs() {
        List<ActivityLog> logs = adminLogService.getAllLogs();
        return ResponseEntity.ok(logs);
    }

}
