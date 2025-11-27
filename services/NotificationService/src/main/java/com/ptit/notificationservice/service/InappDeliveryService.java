package com.ptit.notificationservice.service;

import com.ptit.notificationservice.entity.InappDelivery;
import com.ptit.notificationservice.repository.InappDeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class InappDeliveryService {
    @Autowired
    private InappDeliveryRepository inappDeliveryRepository;

    public InappDelivery save(InappDelivery inappDelivery) {
        return inappDeliveryRepository.save(inappDelivery);
    }

    public Optional<InappDelivery> findById(UUID id) {
        return inappDeliveryRepository.findById(id);
    }

    public List<InappDelivery> findAll() {
        return inappDeliveryRepository.findAll();
    }

    public void deleteById(UUID id) {
        inappDeliveryRepository.deleteById(id);
    }

    public List<InappDelivery> getUserNotifications(UUID userId) {
        return inappDeliveryRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public InappDelivery markAsRead(UUID inappDeliId) {
        InappDelivery delivery = inappDeliveryRepository.findById(inappDeliId).orElseThrow();
        delivery.setIsRead(true);
        return inappDeliveryRepository.save(delivery);
    }

    @Transactional
    public List<InappDelivery> markAllAsRead(UUID userId) {
        List<InappDelivery> deliveries = inappDeliveryRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
        for (InappDelivery delivery : deliveries) {
            delivery.setIsRead(true);
        }
        return inappDeliveryRepository.saveAll(deliveries);
    }

    @Transactional
    public InappDelivery softDelete(UUID inappDeliId) {
        InappDelivery delivery = inappDeliveryRepository.findById(inappDeliId).orElseThrow();
        delivery.setIsDeleted(true);
        return inappDeliveryRepository.save(delivery);
    }
}
