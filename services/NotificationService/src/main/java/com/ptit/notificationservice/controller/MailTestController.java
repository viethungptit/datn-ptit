package com.ptit.notificationservice.controller;

import com.ptit.notificationservice.dto.MailTestRequest;
import com.ptit.notificationservice.service.MailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mail")
public class MailTestController {

    @Autowired
    private MailService mailService;

    @PostMapping("/test")
    public ResponseEntity<String> testSendMail(@RequestBody MailTestRequest request) {
        try {
            mailService.sendMail(request.getTo(), request.getSubject(), request.getBody());
            return ResponseEntity.ok("Email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to send email: " + e.getMessage());
        }
    }
}

