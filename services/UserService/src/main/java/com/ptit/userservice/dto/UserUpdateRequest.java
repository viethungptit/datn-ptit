package com.ptit.userservice.dto;

import com.ptit.userservice.entity.User;
import lombok.Data;

@Data
public class UserUpdateRequest {
    private String fullName;
    private String phone;
}

