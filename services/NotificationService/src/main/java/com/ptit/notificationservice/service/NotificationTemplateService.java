package com.ptit.notificationservice.service;

import com.ptit.notificationservice.dto.NotificationTemplateRequest;
import com.ptit.notificationservice.dto.NotificationTemplateResponse;
import com.ptit.notificationservice.entity.NotificationTemplate;
import com.ptit.notificationservice.exception.BusinessException;
import com.ptit.notificationservice.exception.ResourceNotFoundException;
import com.ptit.notificationservice.repository.NotificationTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationTemplateService {
    @Autowired
    private NotificationTemplateRepository repository;

    @Transactional
    public NotificationTemplateResponse createTemplate(NotificationTemplateRequest request) {
        if (repository.findByEventTypeAndIsDeletedFalse(request.getEventType()).isPresent()) {
            throw new BusinessException("Event type already exists");
        }
        NotificationTemplate template = new NotificationTemplate();
        template.setEventType(request.getEventType());
        template.setEmailSubjectTemplate(request.getEmailSubjectTemplate());
        template.setEmailBodyTemplate(request.getEmailBodyTemplate());
        template.setInappBodyTemplate(request.getInappBodyTemplate());
        template.setDeleted(false);
        NotificationTemplate saved = repository.save(template);
        return toResponse(saved);
    }

    public NotificationTemplate getTemplateByEventType(String eventType) {
        NotificationTemplate template = repository.findByEventTypeAndIsDeletedFalse(eventType)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        return template;
    }

    @Transactional
    public NotificationTemplateResponse updateTemplate(UUID templateId, NotificationTemplateRequest request) {
        NotificationTemplate template = repository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        if (template.getDeleted())
            throw new ResourceNotFoundException("Template not found");
        Optional<NotificationTemplate> existing = repository.findByEventTypeAndIsDeletedFalse(request.getEventType());
        if (existing.isPresent() && !existing.get().getTemplateId().equals(templateId)) {
            throw new BusinessException("Event type already exists");
        }
        template.setEventType(request.getEventType());
        template.setEmailSubjectTemplate(request.getEmailSubjectTemplate());
        template.setEmailBodyTemplate(request.getEmailBodyTemplate());
        template.setInappBodyTemplate(request.getInappBodyTemplate());
        NotificationTemplate updated = repository.save(template);
        return toResponse(updated);
    }

    @Transactional
    public NotificationTemplateResponse deleteTemplate(UUID templateId) {
        NotificationTemplate template = repository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        if (template.getDeleted())
            throw new ResourceNotFoundException("Template not found");
        template.setDeleted(true);
        NotificationTemplate deleted = repository.save(template);
        return toResponse(deleted);
    }

    public java.util.List<NotificationTemplateResponse> getAllTemplates() {
        java.util.List<NotificationTemplate> templates = repository.findAll();
        java.util.List<NotificationTemplateResponse> result = new java.util.ArrayList<>();
        for (NotificationTemplate template : templates) {
            if (!template.getDeleted()) {
                result.add(toResponse(template));
            }
        }
        return result;
    }

    private NotificationTemplateResponse toResponse(NotificationTemplate template) {
        NotificationTemplateResponse response = new NotificationTemplateResponse();
        response.setTemplateId(template.getTemplateId());
        response.setEventType(template.getEventType());
        response.setEmailSubjectTemplate(template.getEmailSubjectTemplate());
        response.setEmailBodyTemplate(template.getEmailBodyTemplate());
        response.setInappBodyTemplate(template.getInappBodyTemplate());
        response.setIsDeleted(template.getDeleted());
        response.setCreatedAt(template.getCreatedAt());
        return response;
    }
}
