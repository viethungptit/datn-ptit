package com.ptit.adminservice.controller;

import com.ptit.adminservice.dto.SystemStatDto;
import com.ptit.adminservice.dto.CreateSystemStatRequest;
import com.ptit.adminservice.service.SystemStatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/stats")
@RequiredArgsConstructor
public class SystemStatController {
    private final SystemStatService systemStatService;

    @GetMapping
    public ResponseEntity<SystemStatDto> getDashboardStats() {
        SystemStatDto stat = systemStatService.getLatestStat();
        return ResponseEntity.ok(stat);
    }

    @GetMapping("/all")
    public ResponseEntity<List<SystemStatDto>> getAllStats() {
        List<SystemStatDto> stats = systemStatService.getAllStats();
        return ResponseEntity.ok(stats);
    }

    @PostMapping
    public ResponseEntity<SystemStatDto> createSystemStat(@RequestBody CreateSystemStatRequest request) {
        SystemStatDto stat = systemStatService.createSystemStat(request);
        return ResponseEntity.ok(stat);
    }
}

