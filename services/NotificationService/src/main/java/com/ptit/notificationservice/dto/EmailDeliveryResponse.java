package com.ptit.notificationservice.dto;

import lombok.*;

import java.sql.Timestamp;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailDeliveryResponse {
    private UUID emailDeliId;
    private UUID notificationId;
    private String notificationEventType;
    private String email;
    private String subject;
    private String body;
    private Object status;
    private Timestamp sentAt;
}

