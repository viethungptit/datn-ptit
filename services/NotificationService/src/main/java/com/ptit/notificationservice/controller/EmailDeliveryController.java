package com.ptit.notificationservice.controller;

import com.ptit.notificationservice.entity.EmailDelivery;
import com.ptit.notificationservice.service.EmailDeliveryService;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import com.ptit.notificationservice.dto.EmailDeliveryResponse;

@RestController
@RequestMapping("/api/notification-service/email-deliveries")
public class EmailDeliveryController {

    private final EmailDeliveryService emailDeliveryService;

    public EmailDeliveryController(EmailDeliveryService emailDeliveryService) {
        this.emailDeliveryService = emailDeliveryService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<EmailDelivery> create(@RequestBody EmailDelivery emailDelivery) {
        EmailDelivery saved = emailDeliveryService.save(emailDelivery);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<EmailDelivery> getById(@PathVariable UUID id) {
        return emailDeliveryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<EmailDelivery>> getAll() {
        return ResponseEntity.ok(emailDeliveryService.findAll());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/paged")
    public ResponseEntity<Page<EmailDeliveryResponse>> getAllEmailDeliveriesWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "sentAt"));
        Page<EmailDeliveryResponse> result;
        result = emailDeliveryService.getAllEmailDeliveriesWithPagination(pageable);
        return ResponseEntity.ok(result);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        emailDeliveryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }


    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{id}/retry")
    public ResponseEntity<?> retry(@PathVariable UUID id) {
        EmailDelivery updated = emailDeliveryService.retrySend(id);
        return ResponseEntity.ok(updated);
    }
}
