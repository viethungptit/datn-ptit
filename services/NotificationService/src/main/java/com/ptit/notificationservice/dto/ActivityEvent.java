package com.ptit.notificationservice.dto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityEvent {
    private String actorId;      // ai thực hiện
    private String actorRole;    // ADMIN / CANDIDATE / EMPLOYER
    private String action;       // CREATE_USER / APPLY_JOB / FORGOT_PASSWORD
    private String targetType;   // USER / JOB / APPLICATION / ...
    private String targetId;     // id đối tượng
    private String description;  // mô tả dễ đọc
}

