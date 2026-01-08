package com.ptit.userservice.repository;

import com.ptit.userservice.entity.Invitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface InvitationRepository extends JpaRepository<Invitation, UUID> {

    Optional<Invitation> findByToken(String token);

    boolean existsByEmailAndCompanyIdAndStatus(
            String email,
            UUID companyId,
            Invitation.Status status
    );
}
