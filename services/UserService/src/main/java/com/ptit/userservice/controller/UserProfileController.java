package com.ptit.userservice.controller;

import com.ptit.userservice.dto.*;
import com.ptit.userservice.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user-service/user-profile")
public class UserProfileController {
    @Autowired
    private UserProfileService userProfileService;

    @PreAuthorize("hasRole('CANDIDATE')")
    @PutMapping(value = "/candidate/me")
    public ResponseEntity<CandidateResponse> upsertCandidate(@RequestBody CandidateUpdate2Request request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        CandidateResponse response = userProfileService.upsertCandidateByUserId(UUID.fromString(currentUserId), request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PutMapping(value = "/employer/me")
    public ResponseEntity<EmployerResponse> upsertEmployer(@RequestBody EmployerUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        EmployerResponse response = userProfileService.upsertEmployerByUserId(UUID.fromString(currentUserId), request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/candidate/for-admin/{userId}", consumes = "multipart/form-data")
    public ResponseEntity<CandidateResponse> upsertCandidateForAdmin(@PathVariable UUID userId, @ModelAttribute CandidateUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        CandidateResponse response = userProfileService.upsertCandidateForAdminByUserId(userId, UUID.fromString(currentUserId), request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/employer/for-admin/{userId}")
    public ResponseEntity<EmployerResponse> upsertEmployerForAdmin(@PathVariable UUID userId, @RequestBody EmployerUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        EmployerResponse response = userProfileService.upsertEmployerForAdminByUserId(userId, UUID.fromString(currentUserId), request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PutMapping(value = "/employer/me/leave")
    public ResponseEntity<EmployerResponse> leaveCompany() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        EmployerResponse response = userProfileService.leaveCompanyByUserId(UUID.fromString(currentUserId));
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/employer/for-admin/{userId}/leave")
    public ResponseEntity<EmployerResponse> leaveCompanyForAdmin(@PathVariable UUID userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        EmployerResponse response = userProfileService.leaveCompanyForAdminByUserId(userId, UUID.fromString(currentUserId));
        return ResponseEntity.ok(response);
    }
}
