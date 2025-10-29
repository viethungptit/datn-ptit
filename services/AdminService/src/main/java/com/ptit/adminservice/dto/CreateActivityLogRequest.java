package com.ptit.adminservice.dto;
import lombok.*;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateActivityLogRequest {
    private UUID actorId;
    private String actorRole;
    private String action;
    private String targetType;
    private UUID targetId;
    private String description;
}
