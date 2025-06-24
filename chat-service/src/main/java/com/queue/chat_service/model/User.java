package com.queue.chat_service.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@Document(collection = "users")
public class User {

    @Id // This will store the UUID string from your Auth Service
    private String id; // Example: "a1b2c3d4-e5f6-7890-1234-567890abcdef"

    private String username; // Display name, can be non-unique for display purposes

    @Indexed(unique = true) // Phone number is unique in your Auth Service
    private String phone;

    private LocalDateTime createdAt;
    private LocalDateTime lastOnline;

    // List of conversation IDs this user is part of.
    // This helps in quickly fetching a user's conversations.
    private List<String> activeConversationIds = new ArrayList<>();

    // Constructor for creating a new chat user profile based on Auth Service data
    public User(String id, String username, String phone) {
        this.id = id;
        this.username = username;
        this.phone = phone;
        this.createdAt = LocalDateTime.now();
        this.lastOnline = LocalDateTime.now();
    }
}