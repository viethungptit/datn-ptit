package com.ptit.notificationservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ptit.notificationservice.dto.UserResponse;
import com.ptit.notificationservice.entity.EmailDelivery;
import com.ptit.notificationservice.entity.InappDelivery;
import com.ptit.notificationservice.entity.Notification;
import com.ptit.notificationservice.entity.NotificationTemplate;
import com.ptit.notificationservice.feign.UserServiceFeign;
import org.apache.commons.text.StringSubstitutor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Map;

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

    @Value("${internal.secret}")
    private String internalSecret;

    public UserResponse getUserByEmail(String email) {
        return userServiceFeign.getUserByEmail(email, internalSecret);
    }

    @RabbitListener(queues = "${notification.queue}")
    public void handleUserRegisterEvent(String message) {
        try {
            System.out.println("Received message: " + message);
            JsonNode event = objectMapper.readTree(message);
            String eventType = event.get("event_type").asText();
            String email = event.get("to").asText();
            Map data = objectMapper.convertValue(event.get("data"), Map.class);

            NotificationTemplate template = templateService.getTemplateByEventType(eventType);

            StringSubstitutor sub = new StringSubstitutor(data, "{{", "}}");
            String subject = sub.replace(template.getEmailSubjectTemplate());
            String body = sub.replace(template.getEmailBodyTemplate());
            String notificationContent = sub.replace(template.getInappBodyTemplate());

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
                .content(notificationContent)
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

    @RabbitListener(queues = "${alert.queue}")
    public void handleSystemAlert(String message) {
        try {
            System.out.println("Received alert message: " + message);
            JsonNode event = objectMapper.readTree(message);

            String eventType = event.get("event_type").asText();
            String to = event.get("to").asText();
            Map<String, Object> data = objectMapper.convertValue(event.get("data"), Map.class);

            NotificationTemplate template = templateService.getTemplateByEventType(eventType);
            if (template == null) {
                System.err.println("Không tìm thấy template cho event_type: " + eventType);
                return;
            }

            StringSubstitutor sub = new StringSubstitutor(data, "{{", "}}");
            String subject = sub.replace(template.getEmailSubjectTemplate());
            String body = sub.replace(template.getEmailBodyTemplate());

            String[] emails = to.split(",");
            for (String email : emails) {
                try {
                    mailService.sendMail(email.trim(), subject, body);
                    System.out.println("Gửi alert email thành công tới " + email);
                } catch (Exception ex) {
                    System.err.println("Gửi email thất bại tới " + email + ": " + ex.getMessage());
                }
            }

            Notification notification = Notification.builder()
                    .template(template)
                    .eventType(eventType)
                    .payload(message)
                    .build();
            notification = notificationService.save(notification);

            for (String email : emails) {
                EmailDelivery emailDelivery = EmailDelivery.builder()
                        .notification(notification)
                        .email(email.trim())
                        .subject(subject)
                        .body(body)
                        .status(EmailDelivery.EmailDeliveryStatus.success)
                        .build();
                emailDeliveryService.save(emailDelivery);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }


}
