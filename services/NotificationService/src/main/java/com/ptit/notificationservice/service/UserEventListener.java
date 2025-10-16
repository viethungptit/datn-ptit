package com.ptit.notificationservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.notificationservice.dto.UserResponse;
import com.ptit.notificationservice.entity.EmailDelivery;
import com.ptit.notificationservice.entity.InappDelivery;
import com.ptit.notificationservice.entity.Notification;
import com.ptit.notificationservice.entity.NotificationTemplate;
import com.ptit.notificationservice.feign.UserServiceFeign;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Service
public class UserEventListener {
    @Autowired
    private NotificationTemplateService templateService;
    @Autowired
    private MailService mailService;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private EmailDeliveryService emailDeliveryService;
    @Autowired
    private InappDeliveryService inappDeliveryService;
    @Autowired
    private UserServiceFeign userServiceFeign;

    public UserResponse getUserByEmail(String email) {
        return userServiceFeign.getUserByEmail(email);
    }

    @RabbitListener(queues = "${notification.user.queue}")
    public void handleUserRegisterEvent(String message) {
        try {
            JsonNode event = objectMapper.readTree(message);
            String email = event.get("email").asText();
            String name = event.get("name").asText();
            String otp = event.get("otp").asText();
            String eventType = event.get("event_type").asText();

            NotificationTemplate template = templateService.getTemplateByEventType(eventType);
            String subject = template.getEmailSubjectTemplate()
                .replace("{{name}}", name)
                .replace("{{otp}}", otp);
            String body = template.getEmailBodyTemplate()
                .replace("{{name}}", name)
                .replace("{{otp}}", otp)
                .replace("{{email}}", email);

            UserResponse user = null;
            try {
                user = getUserByEmail(email);
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            // Tạo Notification
            Notification notification = Notification.builder()
                .userId(user != null ? user.getUserId() : null)
                .template(template)
                .eventType(eventType)
                .payload(message)
                .build();
            notification = notificationService.save(notification);

            // Tạo EmailDelivery với status = pending
            EmailDelivery emailDelivery = EmailDelivery.builder()
                .notification(notification)
                .email(email)
                .subject(subject)
                .body(body)
                .status(EmailDelivery.EmailDeliveryStatus.pending)
                .build();
            emailDelivery = emailDeliveryService.save(emailDelivery);

            // Tạo InappDelivery
            InappDelivery inappDelivery = InappDelivery.builder()
                .notification(notification)
                .userId(user != null ? user.getUserId() : null)
                .content(template.getInappBodyTemplate())
                .isRead(false)
                .isDeleted(false)
                .createdAt(Timestamp.valueOf(LocalDateTime.now()))
                .build();
            inappDeliveryService.save(inappDelivery);

            try {
                mailService.sendMail(email, subject, body);
                emailDelivery.setStatus(EmailDelivery.EmailDeliveryStatus.success);
            } catch (Exception ex) {
                emailDelivery.setStatus(EmailDelivery.EmailDeliveryStatus.fail);
            }
            emailDeliveryService.save(emailDelivery);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
