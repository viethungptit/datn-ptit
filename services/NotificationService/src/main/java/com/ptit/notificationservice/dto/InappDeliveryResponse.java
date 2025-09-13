package com.ptit.notificationservice.dto;

import lombok.Data;
import java.sql.Timestamp;
import java.util.UUID;

@Data
public class InappDeliveryResponse {
    private UUID inapp_deli_id;
    private String content;
    private Boolean is_read;
    private Boolean is_deleted;
    private Timestamp created_at;
}

