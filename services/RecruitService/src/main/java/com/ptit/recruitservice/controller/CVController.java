package com.ptit.recruitservice.controller;

import com.ptit.recruitservice.dto.*;
import com.ptit.recruitservice.entity.CV;
import com.ptit.recruitservice.entity.Job;
import com.ptit.recruitservice.service.CVService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
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

    @Value("${internal.secret}")
    private String internalSecret;

    @PreAuthorize("hasRole('CANDIDATE')")
    @PostMapping(consumes = "multipart/form-data")
    public CVDto createCV(@ModelAttribute CVCreateRequest request) {
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
    @PutMapping(value = "/{cv_id}", consumes = "multipart/form-data")
    public CVDto updateCV(@PathVariable("cv_id") UUID cvId, @ModelAttribute CVUpdateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return cvService.updateCV(cvId, request, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PutMapping(value = "/{cv_id}/name/{nameCV}")
    public CVDto updateNameCV(@PathVariable("cv_id") UUID cvId, @PathVariable("nameCV") String nameCV) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return cvService.updateNameCV(cvId, nameCV, UUID.fromString(currentUserId));
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN')")
    @DeleteMapping("/{cv_id}")
    public CVDto deleteCV(@PathVariable("cv_id") UUID cvId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return cvService.deleteCV(cvId, UUID.fromString(currentUserId), isAdmin);
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'EMPLOYER', 'ADMIN')")
    @PostMapping("/{cv_id}/export")
    public CVExportResponse exportCV(@PathVariable("cv_id") UUID cvId) {
        return cvService.exportCV(cvId);
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @GetMapping("/me")
    public List<CVDto> getAllCVsMe(@RequestParam(value = "source_type", required = false) String sourceType) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return cvService.getAllCVsMe(UUID.fromString(currentUserId), sourceType);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all-by-user/{user_id}")
    public List<CVDto> getAllCVsByUser(@PathVariable("user_id") UUID userId) {
        return cvService.getAllCVsByUser(userId);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public List<CVDto> getAllCVs() {
        return cvService.getAllCVs();
    }

    @PreAuthorize("hasAnyRole('CANDIDATE', 'ADMIN')")
    @PostMapping("/{cv_id}/retry-embedding")
    public CVDto retryEmbedding(@PathVariable("cv_id") UUID cvId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return cvService.retryEmbedding(cvId, UUID.fromString(currentUserId), isAdmin);
    }

    @PutMapping("/{cv_id}/status-embedding")
    public CVDto updateStatusEmbedding(@PathVariable("cv_id") UUID cvId,
                                        @RequestParam("status") CV.StatusEmbedding status,
                                        @RequestHeader("X-Internal-Secret") String secret) {
        if (!internalSecret.equals(secret)) {
            throw new AccessDeniedException("Access denied: invalid internal secret");
        }
        return cvService.updateStatusEmbedding(cvId, status);
    }
}
