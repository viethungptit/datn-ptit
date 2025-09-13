package com.ptit.userservice.controller;

import com.ptit.userservice.dto.CandidateResponse;
import com.ptit.userservice.dto.CandidateUpdateRequest;
import com.ptit.userservice.dto.EmployerResponse;
import com.ptit.userservice.dto.EmployerUpdateRequest;
import com.ptit.userservice.service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/user-profile")
public class UserProfileController {
    @Autowired
    private UserProfileService userProfileService;

    @PutMapping(value = "/candidate/{userId}", consumes = "multipart/form-data")
    public ResponseEntity<CandidateResponse> upsertCandidate(@PathVariable UUID userId, @ModelAttribute CandidateUpdateRequest request) {
        CandidateResponse response = userProfileService.upsertCandidateByUserId(userId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/employer/{userId}")
    public ResponseEntity<EmployerResponse> upsertEmployer(@PathVariable UUID userId, @ModelAttribute EmployerUpdateRequest request) {
        EmployerResponse response = userProfileService.upsertEmployerByUserId(userId, request);
        return ResponseEntity.ok(response);
    }
}
