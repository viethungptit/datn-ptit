package com.ptit.userservice.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invitations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invitation {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private UUID companyId;

    @Column(nullable = false)
    private String role; // EMPLOYER

    @Enumerated(EnumType.STRING)
    private Status status;

    private LocalDateTime expiresAt;

    private LocalDateTime createdAt;

    private LocalDateTime acceptedAt;

    public enum Status {
        PENDING,
        ACCEPTED,
        EXPIRED
    }
}
