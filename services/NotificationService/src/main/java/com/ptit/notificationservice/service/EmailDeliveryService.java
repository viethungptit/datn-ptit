package com.ptit.notificationservice.service;

import com.ptit.notificationservice.entity.EmailDelivery;
import com.ptit.notificationservice.repository.EmailDeliveryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EmailDeliveryService {
    @Autowired
    private EmailDeliveryRepository emailDeliveryRepository;

    public EmailDelivery save(EmailDelivery emailDelivery) {
        return emailDeliveryRepository.save(emailDelivery);
    }

    public Optional<EmailDelivery> findById(UUID id) {
        return emailDeliveryRepository.findById(id);
    }

    public List<EmailDelivery> findAll() {
        return emailDeliveryRepository.findAll();
    }

    public void deleteById(UUID id) {
        emailDeliveryRepository.deleteById(id);
    }
}

