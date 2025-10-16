package com.ptit.userservice.controller;

import com.ptit.userservice.dto.CandidateResponse;
import com.ptit.userservice.dto.CandidateUpdateRequest;
import com.ptit.userservice.dto.EmployerResponse;
import com.ptit.userservice.dto.EmployerUpdateRequest;
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

    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN')")
    @PutMapping(value = "/candidate/{userId}", consumes = "multipart/form-data")
    public ResponseEntity<CandidateResponse> upsertCandidate(@PathVariable UUID userId, @ModelAttribute CandidateUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        CandidateResponse response = userProfileService.upsertCandidateByUserId(userId, UUID.fromString(currentUserId), request, isAdmin);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @PutMapping(value = "/employer/{userId}")
    public ResponseEntity<EmployerResponse> upsertEmployer(@PathVariable UUID userId, @ModelAttribute EmployerUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        EmployerResponse response = userProfileService.upsertEmployerByUserId(userId, UUID.fromString(currentUserId), request, isAdmin);
        return ResponseEntity.ok(response);
    }
}
