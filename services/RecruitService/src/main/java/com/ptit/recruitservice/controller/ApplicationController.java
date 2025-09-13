package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.ApplicationRequest;
import com.ptit.recruitservice.dto.ApplicationStatusUpdateRequest;
import com.ptit.recruitservice.dto.ApplicationResponse;
import com.ptit.recruitservice.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    @Autowired
    private ApplicationService applicationService;

    // Helper to get userId from JWT (assumes principal is UUID)
    private UUID getUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return UUID.fromString(auth.getName());
    }

    @PostMapping
    public ResponseEntity<ApplicationResponse> applyForJob(@RequestBody ApplicationRequest request) {
        // TODO: Check role = candidate
        ApplicationResponse response = applicationService.applyForJob(request, getUserId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> updateStatus(@PathVariable UUID applicationId, @RequestBody ApplicationStatusUpdateRequest request) {
        ApplicationResponse response = applicationService.updateStatus(applicationId, request.getStatus());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> deleteApplication(@PathVariable UUID applicationId) {
        ApplicationResponse response = applicationService.deleteApplication(applicationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByJobId(@RequestParam("job_id") UUID jobId) {
        List<ApplicationResponse> responses = applicationService.getApplicationsByJobId(jobId);
        return ResponseEntity.ok(responses);
    }
}

