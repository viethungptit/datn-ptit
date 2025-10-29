package com.ptit.notificationservice.service;

import com.ptit.notificationservice.config.EventPublisher;
import com.ptit.notificationservice.dto.ActivityEvent;
import com.ptit.notificationservice.dto.NotificationTemplateRequest;
import com.ptit.notificationservice.dto.NotificationTemplateResponse;
import com.ptit.notificationservice.entity.NotificationTemplate;
import com.ptit.notificationservice.exception.BusinessException;
import com.ptit.notificationservice.exception.ResourceNotFoundException;
import com.ptit.notificationservice.repository.NotificationTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class NotificationTemplateService {
    @Autowired
    private NotificationTemplateRepository repository;

    @Autowired
    private EventPublisher eventPublisher;

    @Value("${log.exchange}")
    private String logExchange;

    @Value("${log.activity.routing-key}")
    private String logActivityRoutingKey;

    @Transactional
    public NotificationTemplateResponse createTemplate(NotificationTemplateRequest request, UUID currentUserId) {
        if (repository.findByEventTypeAndIsDeletedFalse(request.getEventType()).isPresent()) {
            throw new BusinessException("Loại sự kiện đã tồn tại");
        }
        NotificationTemplate template = new NotificationTemplate();
        template.setEventType(request.getEventType());
        template.setEmailSubjectTemplate(request.getEmailSubjectTemplate());
        template.setEmailBodyTemplate(request.getEmailBodyTemplate());
        template.setInappBodyTemplate(request.getInappBodyTemplate());
        template.setDeleted(false);
        NotificationTemplate saved = repository.save(template);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("CREATE_NOTIFICATION_TEMPLATE")
                        .targetType("NOTIFICATION_TEMPLATE")
                        .targetId(template.getTemplateId().toString())
                        .description(String.format("Quản trị viên %s đã tạo mẫu thông báo mới %s",
                                currentUserId, template.getTemplateId()))
                        .build()
        );
        return toResponse(saved);
    }

    public NotificationTemplate getTemplateByEventType(String eventType) {
        NotificationTemplate template = repository.findByEventTypeAndIsDeletedFalse(eventType)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu cho loại sự kiện"));
        return template;
    }

    @Transactional
    public NotificationTemplateResponse updateTemplate(UUID templateId, NotificationTemplateRequest request, UUID currentUserId) {
        NotificationTemplate template = repository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu cho loại sự kiện"));
        if (template.getDeleted())
            throw new ResourceNotFoundException("Không tìm thấy mẫu cho loại sự kiện");
        Optional<NotificationTemplate> existing = repository.findByEventTypeAndIsDeletedFalse(request.getEventType());
        if (existing.isPresent() && !existing.get().getTemplateId().equals(templateId)) {
            throw new BusinessException("Loại sự kiện đã tồn tại");
        }
        template.setEventType(request.getEventType());
        template.setEmailSubjectTemplate(request.getEmailSubjectTemplate());
        template.setEmailBodyTemplate(request.getEmailBodyTemplate());
        template.setInappBodyTemplate(request.getInappBodyTemplate());
        NotificationTemplate updated = repository.save(template);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("UPDATE_NOTIFICATION_TEMPLATE")
                        .targetType("NOTIFICATION_TEMPLATE")
                        .targetId(template.getTemplateId().toString())
                        .description(String.format("Quản trị viên %s đã chỉnh sửa mẫu thông báo %s",
                                currentUserId, template.getTemplateId()))
                        .build()
        );

        return toResponse(updated);
    }

    @Transactional
    public NotificationTemplateResponse deleteTemplate(UUID templateId, UUID currentUserId) {
        NotificationTemplate template = repository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mẫu cho loại sự kiện"));
        if (template.getDeleted())
            throw new ResourceNotFoundException("Không tìm thấy mẫu cho loại sự kiện");
        template.setDeleted(true);
        NotificationTemplate deleted = repository.save(template);

        // Gửi log sang AdminService
        eventPublisher.publish(
                logExchange,
                logActivityRoutingKey,
                ActivityEvent.builder()
                        .actorId(currentUserId.toString())
                        .actorRole("ADMIN")
                        .action("DELETE_NOTIFICATION_TEMPLATE")
                        .targetType("NOTIFICATION_TEMPLATE")
                        .targetId(template.getTemplateId().toString())
                        .description(String.format("Quản trị viên %s đã xóa mẫu thông báo %s",
                                currentUserId, template.getTemplateId()))
                        .build()
        );

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
