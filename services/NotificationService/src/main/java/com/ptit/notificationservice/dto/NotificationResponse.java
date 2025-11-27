package com.ptit.notificationservice.dto;

import lombok.*;

import java.sql.Timestamp;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private UUID notificationId;
    private UUID userId;
    private UUID templateId;
    private String templateEventType;
    private String eventType;
    private String payload;
    private Timestamp createdAt;
}

