package com.ptit.adminservice.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class CreateAdminLogRequest {
    private UUID userId;
    private String action;
    private String details;
}
