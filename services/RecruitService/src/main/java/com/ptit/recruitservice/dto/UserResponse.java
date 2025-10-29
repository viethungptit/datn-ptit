package com.ptit.recruitservice.dto;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserResponse {
    private String email;
    private String fullName;
}