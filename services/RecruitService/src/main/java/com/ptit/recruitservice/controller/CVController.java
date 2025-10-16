package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.*;
import com.ptit.recruitservice.service.CVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/recruit-service/cvs")
public class CVController {
    @Autowired
    private CVService cvService;

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping
    public CVDto createCV(@RequestBody CVCreateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return cvService.createCV(request, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public CVDto uploadCV(@ModelAttribute CVUploadRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return cvService.uploadCV(req, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'EMPLOYER', 'ADMIN')")
    @GetMapping("/{cv_id}")
    public CVDto getCV(@PathVariable("cv_id") UUID cvId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        boolean isPrivilegedUser = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                        || a.getAuthority().equals("ROLE_EMPLOYER"));
        return cvService.getCV(cvId, UUID.fromString(currentUserId), isPrivilegedUser);
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PutMapping("/{cv_id}")
    public CVDto updateCV(@PathVariable("cv_id") UUID cvId, @RequestBody CVUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return cvService.updateCV(cvId, request, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN)")
    @DeleteMapping("/{cv_id}")
    public CVDto deleteCV(@PathVariable("cv_id") UUID cvId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return cvService.deleteCV(cvId, UUID.fromString(currentUserId), isAdmin);
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'EMPLOYER', 'ADMIN)")
    @PostMapping("/{cv_id}/export")
    public CVExportResponse exportCV(@PathVariable("cv_id") UUID cvId) {
        return cvService.exportCV(cvId);
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN')")
    @GetMapping("/all-by-user/{user_id}")
    public List<CVDto> getAllCVsByUser(@PathVariable("user_id") UUID userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return cvService.getAllCVsByUser(userId, UUID.fromString(currentUserId), isAdmin);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public List<CVDto> getAllCVs() {
        return cvService.getAllCVs();
    }
}

