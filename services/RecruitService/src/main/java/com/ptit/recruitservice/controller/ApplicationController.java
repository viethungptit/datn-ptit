package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.ApplicationRequest;
import com.ptit.recruitservice.dto.ApplicationStatusUpdateRequest;
import com.ptit.recruitservice.dto.ApplicationResponse;
import com.ptit.recruitservice.service.ApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruit-service/applications")
public class ApplicationController {
    @Autowired
    private ApplicationService applicationService;

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping
    public ResponseEntity<ApplicationResponse> applyForJob(@RequestBody ApplicationRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        ApplicationResponse response = applicationService.applyForJob(request, UUID.fromString(currentUserId));
        return ResponseEntity.ok(response);
    }
    @PreAuthorize("hasRole('CANDIDATE')")
    @GetMapping("/candidate")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByJobIdForCandidate(@RequestParam("job_id") UUID jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserIdStr = (String) auth.getPrincipal();
        UUID currentUserId = UUID.fromString(currentUserIdStr);
        List<ApplicationResponse> responses = applicationService.getApplicationsByJobIdForCandidate(jobId,currentUserId);
        return ResponseEntity.ok(responses);
    }
    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @PutMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> updateStatus(@PathVariable UUID applicationId, @RequestBody ApplicationStatusUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        ApplicationResponse response = applicationService.updateStatus(applicationId, request.getStatus(), UUID.fromString(currentUserId));
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<ApplicationResponse> deleteApplication(@PathVariable UUID applicationId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        ApplicationResponse response = applicationService.deleteApplication(applicationId, UUID.fromString(currentUserId));
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByJobId(@RequestParam("job_id") UUID jobId) {
        List<ApplicationResponse> responses = applicationService.getApplicationsByJobId(jobId);
        return ResponseEntity.ok(responses);
    }
}

