package com.ptit.userservice.dto;

import java.time.LocalDateTime;

public class RegisterResponse {
    public String userId;
    public String email;
    public String fullName;
    public String role;
    public String status;
    public boolean isDeleted;
    public LocalDateTime createdAt;
}

