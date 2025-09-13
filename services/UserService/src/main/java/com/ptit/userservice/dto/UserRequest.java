package com.ptit.userservice.dto;

import com.ptit.userservice.entity.User;
import lombok.Data;

@Data
public class UserRequest {
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private User.Role role;
}

