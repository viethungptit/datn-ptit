package com.ptit.adminservice.controller;

import com.ptit.adminservice.dto.SystemStatDto;
import com.ptit.adminservice.dto.CreateSystemStatRequest;
import com.ptit.adminservice.service.SystemStatService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/admin-service/stats")
@RequiredArgsConstructor
public class SystemStatController {
    private final SystemStatService systemStatService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<SystemStatDto> getDashboardStats() {
        SystemStatDto stat = systemStatService.getLatestStat();
        return ResponseEntity.ok(stat);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<SystemStatDto>> getAllStats(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        try {
            Instant start = null;
            Instant end = null;
            if (from != null && !from.isBlank()) start = Instant.parse(from);
            if (to != null && !to.isBlank()) end = Instant.parse(to);

            if (start != null && end != null && start.isAfter(end)) {
                return ResponseEntity.badRequest().build();
            }

            List<SystemStatDto> stats;
            if (start == null && end == null) {
                stats = systemStatService.getAllStats();
            } else {
                stats = systemStatService.getAllStats(start, end);
            }
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
