package com.ptit.adminservice.dto;

import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Data
public class AdminLogDto {
    private UUID logId;
    private UUID userId;
    private String action;
    private String details;
    private Instant createdAt;
}

