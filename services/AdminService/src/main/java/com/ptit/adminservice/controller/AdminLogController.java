package com.ptit.adminservice.controller;

import com.ptit.adminservice.dto.AdminLogDto;
import com.ptit.adminservice.dto.CreateAdminLogRequest;
import com.ptit.adminservice.service.AdminLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class AdminLogController {
    private final AdminLogService adminLogService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAdminLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) Long start,
            @RequestParam(required = false) Long end
    ) {
        Instant startTime = start != null ? Instant.ofEpochMilli(start) : null;
        Instant endTime = end != null ? Instant.ofEpochMilli(end) : null;
        Page<AdminLogDto> logPage = adminLogService.getLogs(page, size, action, startTime, endTime);
        Map<String, Object> response = new HashMap<>();
        response.put("logs", logPage.getContent());
        response.put("total", logPage.getTotalElements());
        response.put("page", logPage.getNumber());
        response.put("size", logPage.getSize());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<AdminLogDto> createAdminLog(@RequestBody CreateAdminLogRequest request) {
        AdminLogDto log = adminLogService.createAdminLog(request);
        return ResponseEntity.ok(log);
    }
}

