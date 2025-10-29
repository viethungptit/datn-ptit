package com.ptit.adminservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminAlertEvent {
    private String service;       // "UserService"
    private String type;          // "DOWN" | "HIGH_CPU"
    private String message;       // "UserService không phản hồi"
    private List<String> recipients; // các email admin
    private Instant timestamp;
}
