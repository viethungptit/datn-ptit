package com.ptit.notificationservice.dto;

import lombok.Data;

@Data
public class MailTestRequest {
    private String to;
    private String subject;
    private String body;
}

