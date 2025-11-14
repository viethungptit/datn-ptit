package com.ptit.userservice.controller;

import com.ptit.userservice.dto.*;
import com.ptit.userservice.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-service/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @Value("${internal.secret}")
    private String internalSecret;

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyResponse> createCompany(
        @ModelAttribute  CompanyCreateRequest request
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        return ResponseEntity.ok(companyService.createCompany(request, isAdmin, UUID.fromString(currentUserId)));
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<CompanyResponse> getCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(companyService.getCompany(companyId));
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAllCompanies(@RequestParam(required = false) String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return ResponseEntity.ok(companyService.getAllCompanies());
        }
        return ResponseEntity.ok(companyService.searchCompanies(keyword));
    }

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @PutMapping(value = "/{companyId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyResponse> updateCompany(
        @PathVariable UUID companyId,
        @ModelAttribute  CompanyUpdateRequest request
    ) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(companyService.updateCompany(companyId, request, isAdmin, UUID.fromString(currentUserId)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{companyId}/verify")
    public ResponseEntity<CompanyResponse> verifyCompany(@PathVariable UUID companyId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return ResponseEntity.ok(companyService.verifyCompany(companyId, UUID.fromString(currentUserId)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{companyId}")
    public ResponseEntity<CompanyResponse> deleteCompany(@PathVariable UUID companyId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return ResponseEntity.ok(companyService.deleteCompany(companyId, UUID.fromString(currentUserId)));
    }


    @GetMapping("/by-user/{userId}")
    public ResponseEntity<CompanyResponse> getCompanyByUserId(@PathVariable UUID userId, @RequestHeader("X-Internal-Secret") String secret) {
        if (!internalSecret.equals(secret)) {
            throw new AccessDeniedException("Access denied: invalid internal secret");
        }
        return ResponseEntity.ok(companyService.getCompanyByUserId(userId));
    }

    @GetMapping("/by-companyId/{companyId}")
    public ResponseEntity<CompanyResponse> getCompanyByCompanyId(@PathVariable UUID companyId, @RequestHeader("X-Internal-Secret") String secret) {
        if (!internalSecret.equals(secret)) {
            throw new AccessDeniedException("Access denied: invalid internal secret");
        }
        return ResponseEntity.ok(companyService.getCompanyByCompanyId(companyId));
    }

    @GetMapping("/{companyId}/employers")
    public ResponseEntity<List<EmployerResponse>> getEmployersByCompany(@PathVariable UUID companyId) {
        List<EmployerResponse> employers = companyService.getAllEmployersByCompany(companyId);
        return ResponseEntity.ok(employers);
    }
}
