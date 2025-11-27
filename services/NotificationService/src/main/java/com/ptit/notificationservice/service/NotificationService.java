package com.ptit.notificationservice.service;

import com.ptit.notificationservice.entity.Notification;
import com.ptit.notificationservice.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.ptit.notificationservice.dto.NotificationResponse;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;

    public Notification save(Notification notification) {
        return notificationRepository.save(notification);
    }

    public Optional<Notification> findById(UUID id) {
        return notificationRepository.findById(id);
    }

    public List<Notification> findAll() {
        return notificationRepository.findAll();
    }

    public void deleteById(UUID id) {
        notificationRepository.deleteById(id);
    }

    // Pagination methods used by controller
    public Page<NotificationResponse> getAllNotificationsWithPagination(Pageable pageable) {
        return notificationRepository.findAll(pageable)
                .map(this::toResponse);
    }

    private NotificationResponse toResponse(Notification n) {
        var builder = NotificationResponse.builder()
                .notificationId(n.getNotificationId())
                .userId(n.getUserId())
                .eventType(n.getEventType())
                .payload(n.getPayload())
                .createdAt(n.getCreatedAt());
        if (n.getTemplate() != null) {
            builder.templateId(n.getTemplate().getTemplateId())
                   .templateEventType(n.getTemplate().getEventType());
        }
        return builder.build();
    }
}
