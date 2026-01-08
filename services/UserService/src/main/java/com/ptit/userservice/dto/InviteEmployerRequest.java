package com.ptit.userservice.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class InviteEmployerRequest {
    private String email;
    private UUID companyId;
}
