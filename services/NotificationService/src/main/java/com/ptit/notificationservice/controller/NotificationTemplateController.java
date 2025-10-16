package com.ptit.notificationservice.controller;

import com.ptit.notificationservice.dto.NotificationTemplateRequest;
import com.ptit.notificationservice.dto.NotificationTemplateResponse;
import com.ptit.notificationservice.entity.NotificationTemplate;
import com.ptit.notificationservice.service.NotificationTemplateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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
        return ResponseEntity.ok(service.createTemplate(request));
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
        return ResponseEntity.ok(service.updateTemplate(templateId, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{templateId}")
    public ResponseEntity<NotificationTemplateResponse> deleteTemplate(@PathVariable UUID templateId) {
        return ResponseEntity.ok(service.deleteTemplate(templateId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<java.util.List<NotificationTemplateResponse>> getAllTemplates() {
        return ResponseEntity.ok(service.getAllTemplates());
    }
}
