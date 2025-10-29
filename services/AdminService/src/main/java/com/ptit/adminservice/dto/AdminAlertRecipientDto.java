package com.ptit.adminservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class AdminAlertRecipientDto {
    private UUID recipientId;
    private String email;
    private Instant createdAt;
}
