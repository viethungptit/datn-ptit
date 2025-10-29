package com.ptit.adminservice.service;

import com.ptit.adminservice.dto.AdminAlertRecipientDto;
import com.ptit.adminservice.entity.AdminAlertRecipient;
import com.ptit.adminservice.exception.ResourceNotFoundException;
import com.ptit.adminservice.repository.AdminAlertRecipientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
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
        repository.deleteAll();
        if (emails == null || emails.isEmpty()) return Collections.emptyList();
        List<String> normalized = normalizeEmails(emails);
        List<AdminAlertRecipient> toSave = normalized.stream()
                .map(email -> AdminAlertRecipient.builder()
                        .email(email)
                        .createdAt(Instant.now())
                        .build())
                .collect(Collectors.toList());
        if (!toSave.isEmpty()) repository.saveAll(toSave);
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public List<AdminAlertRecipientDto> updateRecipients(List<String> emails) {
        return createRecipients(emails);
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
