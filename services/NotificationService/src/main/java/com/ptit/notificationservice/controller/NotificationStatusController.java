package com.ptit.notificationservice.controller;

import com.ptit.notificationservice.dto.InappDeliveryResponse;
import com.ptit.notificationservice.entity.InappDelivery;
import com.ptit.notificationservice.service.InappDeliveryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationStatusController {
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

    @GetMapping("/all")
    public List<InappDeliveryResponse> getAllNotifications(@RequestParam("user_id") UUID userId) {
        return inappDeliveryService.getUserNotifications(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @PutMapping("/{inapp_deli_id}")
    public InappDeliveryResponse markAsRead(@PathVariable("inapp_deli_id") UUID inappDeliId) {
        return toResponse(inappDeliveryService.markAsRead(inappDeliId));
    }

    @PutMapping("/all/{user_id}")
    public List<InappDeliveryResponse> markAllAsRead(@PathVariable("user_id") UUID userId) {
        return inappDeliveryService.markAllAsRead(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @DeleteMapping("/{inapp_deli_id}")
    public InappDeliveryResponse deleteNotification(@PathVariable("inapp_deli_id") UUID inappDeliId) {
        return toResponse(inappDeliveryService.softDelete(inappDeliId));
    }
}

