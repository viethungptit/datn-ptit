package com.ptit.adminservice.service;

import com.ptit.adminservice.dto.AdminAlertRecipientDto;
import com.ptit.adminservice.entity.AdminAlertRecipient;
import com.ptit.adminservice.exception.ResourceNotFoundException;
import com.ptit.adminservice.repository.AdminAlertRecipientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminAlertRecipientService {
    private final AdminAlertRecipientRepository repository;

    public List<AdminAlertRecipientDto> getAllRecipients() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public List<AdminAlertRecipientDto> createRecipients(List<String> emails) {
        repository.truncateAll();
        if (emails == null || emails.isEmpty()) return Collections.emptyList();
        Set<String> normalized = new LinkedHashSet<>(normalizeEmails(emails));
        List<AdminAlertRecipient> toSave = normalized.stream()
                .map(email -> AdminAlertRecipient.builder()
                        .email(email)
                        .createdAt(Instant.now())
                        .build())
                .collect(Collectors.toList());

        repository.saveAll(toSave);
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }


    private AdminAlertRecipientDto toDto(AdminAlertRecipient r) {
        return AdminAlertRecipientDto.builder()
                .recipientId(r.getRecipientId())
                .email(r.getEmail())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private List<String> normalizeEmails(List<String> emails) {
        return emails.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .distinct()
                .collect(Collectors.toList());
    }
}
