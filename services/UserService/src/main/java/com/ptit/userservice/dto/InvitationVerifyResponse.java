package com.ptit.userservice.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class InvitationVerifyResponse {
    private boolean valid;
    private boolean userExists;
    private String email;
    private UUID companyId;
    private String role;
}
