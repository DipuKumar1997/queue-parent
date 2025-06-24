package com.queue.auth_service.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tokens")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    private User user;

    @Column(nullable = false)
    private String refreshToken;

    private String deviceInfo;

    private LocalDateTime issuedAt;
    private LocalDateTime expiresAt;

    private boolean isValid = true;
}
