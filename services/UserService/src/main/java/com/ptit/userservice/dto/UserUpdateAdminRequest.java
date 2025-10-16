package com.ptit.userservice.dto;

import com.ptit.userservice.entity.User;
import lombok.Data;

@Data
public class UserUpdateAdminRequest {
    private String password;
    private String fullName;
    private String phone;
    private User.Role role;
}