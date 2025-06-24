package com.queue.auth_service.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "devices")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String deviceInfo;

    private String deviceType;

    private LocalDateTime lastActive;

    @ManyToOne
    private User user;
}
