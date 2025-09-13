package com.ptit.userservice.controller;

import com.ptit.userservice.dto.*;
import com.ptit.userservice.service.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyResponse> createCompany(
        @ModelAttribute  CompanyCreateRequest request
    ) {
        return ResponseEntity.ok(companyService.createCompany(request));
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<CompanyResponse> getCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(companyService.getCompany(companyId));
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponse>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @PutMapping(value = "/{companyId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CompanyResponse> updateCompany(
        @PathVariable UUID companyId,
        @ModelAttribute  CompanyUpdateRequest request
    ) {
        return ResponseEntity.ok(companyService.updateCompany(companyId, request));
    }

    @PutMapping("/{companyId}/verify")
    public ResponseEntity<CompanyResponse> verifyCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(companyService.verifyCompany(companyId));
    }

    @DeleteMapping("/{companyId}")
    public ResponseEntity<CompanyResponse> deleteCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(companyService.deleteCompany(companyId));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<CompanyResponse> getCompanyByUserId(@PathVariable UUID userId) {
        return ResponseEntity.ok(companyService.getCompanyByUserId(userId));
    }
}
