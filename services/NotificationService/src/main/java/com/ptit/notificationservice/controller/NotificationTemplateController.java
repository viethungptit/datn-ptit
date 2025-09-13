package com.ptit.notificationservice.controller;

import com.ptit.notificationservice.dto.NotificationTemplateRequest;
import com.ptit.notificationservice.dto.NotificationTemplateResponse;
import com.ptit.notificationservice.entity.NotificationTemplate;
import com.ptit.notificationservice.service.NotificationTemplateService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/templates")
public class NotificationTemplateController {
    @Autowired
    private NotificationTemplateService service;

    @PostMapping
    public ResponseEntity<NotificationTemplateResponse> createTemplate(
            @Valid @RequestBody NotificationTemplateRequest request) {
        return ResponseEntity.ok(service.createTemplate(request));
    }

    @GetMapping("/{eventType}")
    public ResponseEntity<NotificationTemplate> getTemplateByEventType(@PathVariable String eventType) {
        return ResponseEntity.ok(service.getTemplateByEventType(eventType));
    }

    @PutMapping("/{templateId}")
    public ResponseEntity<NotificationTemplateResponse> updateTemplate(@PathVariable UUID templateId,
            @Valid @RequestBody NotificationTemplateRequest request) {
        return ResponseEntity.ok(service.updateTemplate(templateId, request));
    }

    @DeleteMapping("/{templateId}")
    public ResponseEntity<NotificationTemplateResponse> deleteTemplate(@PathVariable UUID templateId) {
        return ResponseEntity.ok(service.deleteTemplate(templateId));
    }

    @GetMapping
    public ResponseEntity<java.util.List<NotificationTemplateResponse>> getAllTemplates() {
        return ResponseEntity.ok(service.getAllTemplates());
    }
}
