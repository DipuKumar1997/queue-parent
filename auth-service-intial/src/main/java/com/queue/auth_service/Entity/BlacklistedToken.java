package com.queue.auth_service.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "blacklisted_tokens")
public class BlacklistedToken {

    @Id
    private String token; // Token ID or full token (JWT jti claim)

    private LocalDateTime blacklistedAt;
}
