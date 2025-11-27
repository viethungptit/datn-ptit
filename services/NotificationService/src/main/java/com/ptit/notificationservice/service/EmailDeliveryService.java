package com.ptit.notificationservice.service;

import com.ptit.notificationservice.dto.EmailDeliveryResponse;
import com.ptit.notificationservice.entity.EmailDelivery;
import com.ptit.notificationservice.exception.ResourceNotFoundException;
import com.ptit.notificationservice.repository.EmailDeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmailDeliveryService {
    @Autowired
    private EmailDeliveryRepository emailDeliveryRepository;

    @Autowired
    private MailService mailService;

    public EmailDelivery save(EmailDelivery emailDelivery) {
        return emailDeliveryRepository.save(emailDelivery);
    }

    public Optional<EmailDelivery> findById(UUID id) {
        return emailDeliveryRepository.findById(id);
    }

    public List<EmailDelivery> findAll() {
        return emailDeliveryRepository.findAll();
    }

    public void deleteById(UUID id) {
        emailDeliveryRepository.deleteById(id);
    }

    public EmailDelivery retrySend(UUID id) {
        EmailDelivery delivery = emailDeliveryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmailDelivery not found with id: " + id));

        try {
            mailService.sendMail(delivery.getEmail(), delivery.getSubject(), delivery.getBody());
            delivery.setStatus(EmailDelivery.EmailDeliveryStatus.success);
        } catch (Exception ex) {
            delivery.setStatus(EmailDelivery.EmailDeliveryStatus.fail);
            emailDeliveryRepository.save(delivery);
            throw new RuntimeException("Failed to send email: " + ex.getMessage(), ex);
        }
        return emailDeliveryRepository.save(delivery);
    }

    public Page<EmailDeliveryResponse> getAllEmailDeliveriesWithPagination(Pageable pageable) {
        return emailDeliveryRepository.findAll(pageable).map(this::toResponse);
    }

    private EmailDeliveryResponse toResponse(EmailDelivery e) {
        var b = EmailDeliveryResponse.builder()
                .emailDeliId(e.getEmailDeliId())
                .email(e.getEmail())
                .subject(e.getSubject())
                .body(e.getBody())
                .status(e.getStatus())
                .sentAt(e.getSentAt());
        if (e.getNotification() != null) {
            b.notificationId(e.getNotification().getNotificationId())
                    .notificationEventType(e.getNotification().getEventType());
        }
        return b.build();
    }
}
