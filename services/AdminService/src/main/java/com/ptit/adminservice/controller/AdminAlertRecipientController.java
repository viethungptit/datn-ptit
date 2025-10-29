package com.ptit.adminservice.controller;

import com.ptit.adminservice.dto.AdminAlertRecipientDto;
import com.ptit.adminservice.dto.CreateRecipientsRequest;
import com.ptit.adminservice.service.AdminAlertRecipientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin-service/alert-recipients")
@RequiredArgsConstructor
public class AdminAlertRecipientController {
    private final AdminAlertRecipientService service;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<AdminAlertRecipientDto>> getAll() {
        return ResponseEntity.ok(service.getAllRecipients());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<List<AdminAlertRecipientDto>> create(@RequestBody CreateRecipientsRequest request) {
        List<AdminAlertRecipientDto> created = service.createRecipients(request.getEmails());
        return ResponseEntity.ok(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping
    public ResponseEntity<List<AdminAlertRecipientDto>> update(@RequestBody CreateRecipientsRequest request) {
        List<AdminAlertRecipientDto> updated = service.updateRecipients(request.getEmails());
        return ResponseEntity.ok(updated);
    }
}

