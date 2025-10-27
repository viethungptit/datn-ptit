package com.ptit.notificationservice.controller;

import com.ptit.notificationservice.dto.InappDeliveryResponse;
import com.ptit.notificationservice.entity.InappDelivery;
import com.ptit.notificationservice.service.InappDeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notification-service/inapp-deliveries")
public class InAppDeliveryController {
    @Autowired
    private InappDeliveryService inappDeliveryService;

    private InappDeliveryResponse toResponse(InappDelivery delivery) {
        InappDeliveryResponse resp = new InappDeliveryResponse();
        resp.setInapp_deli_id(delivery.getInappDeliId());
        resp.setContent(delivery.getContent());
        resp.setIs_read(delivery.getIsRead());
        resp.setIs_deleted(delivery.getIsDeleted());
        resp.setCreated_at(delivery.getCreatedAt());
        return resp;
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @GetMapping("/all")
    public List<InappDeliveryResponse> getAllNotifications() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return inappDeliveryService.getUserNotifications(UUID.fromString(currentUserId))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PutMapping("/{inapp_deli_id}")
    public InappDeliveryResponse markAsRead(@PathVariable("inapp_deli_id") UUID inappDeliId) {
        return toResponse(inappDeliveryService.markAsRead(inappDeliId));
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @PutMapping("/all")
    public List<InappDeliveryResponse> markAllAsRead() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUserId = (String) auth.getPrincipal();
        return inappDeliveryService.markAllAsRead(UUID.fromString(currentUserId))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @PreAuthorize("hasRole('CANDIDATE')")
    @DeleteMapping("/{inapp_deli_id}")
    public InappDeliveryResponse deleteNotification(@PathVariable("inapp_deli_id") UUID inappDeliId) {
        return toResponse(inappDeliveryService.softDelete(inappDeliId));
    }
}

