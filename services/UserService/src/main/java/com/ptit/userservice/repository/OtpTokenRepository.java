package com.ptit.userservice.repository;

import com.ptit.userservice.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    Optional<OtpToken> findTopByUser_EmailOrderByCreatedAtDesc(String email);
}

