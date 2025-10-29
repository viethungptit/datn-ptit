package com.ptit.notificationservice.controller;

import com.ptit.notificationservice.dto.NotificationTemplateRequest;
import com.ptit.notificationservice.dto.NotificationTemplateResponse;
import com.ptit.notificationservice.entity.NotificationTemplate;
import com.ptit.notificationservice.service.NotificationTemplateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/notification-service/templates")
public class NotificationTemplateController {
    @Autowired
    private NotificationTemplateService service;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<NotificationTemplateResponse> createTemplate(
            @Valid @RequestBody NotificationTemplateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return ResponseEntity.ok(service.createTemplate(request, UUID.fromString(currentUserId)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{eventType}")
    public ResponseEntity<NotificationTemplate> getTemplateByEventType(@PathVariable String eventType) {
        return ResponseEntity.ok(service.getTemplateByEventType(eventType));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{templateId}")
    public ResponseEntity<NotificationTemplateResponse> updateTemplate(@PathVariable UUID templateId,
            @Valid @RequestBody NotificationTemplateRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return ResponseEntity.ok(service.updateTemplate(templateId, request, UUID.fromString(currentUserId)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{templateId}")
    public ResponseEntity<NotificationTemplateResponse> deleteTemplate(@PathVariable UUID templateId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return ResponseEntity.ok(service.deleteTemplate(templateId, UUID.fromString(currentUserId)));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<java.util.List<NotificationTemplateResponse>> getAllTemplates() {
        return ResponseEntity.ok(service.getAllTemplates());
    }
}
