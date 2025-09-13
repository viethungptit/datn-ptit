package com.ptit.userservice.dto;

import com.ptit.userservice.entity.User;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserResponse {
    private UUID userId;
    private String email;
    private String fullName;
    private String phone;
    private User.Role role;
    private boolean isActive;
    private boolean isDeleted;
    private LocalDateTime createdAt;
}
