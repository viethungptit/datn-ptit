package com.ptit.userservice.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class HealthCheckController {
    @GetMapping("/health")
    public String healthCheck() {
        return "UserService is healthy";
    }
}
