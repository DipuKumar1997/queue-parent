package com.queue.chat_service.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Document(collection = "conversations")
// Ensures a unique conversation between two participants, regardless of order
@CompoundIndex(def = "{'participants': 1}", unique = true)
public class Conversation {

    @Id
    private String id;

    // Stores IDs of participants. For one-to-one, this array will have 2 IDs.
    // Indexed for efficient lookup when finding conversations by participant ID.
    @Indexed
    private Set<String> participants = new HashSet<>(); // Using Set to ensure unique participants

    private String type; // e.g., "one_to_one", "group"
    private LocalDateTime createdAt;

    // For displaying the last message in the conversation list (like WhatsApp's inbox)
    private String lastMessageText;
    private String lastMessageSenderId;
    private LocalDateTime lastMessageTimestamp;

    // Optional: Keep track of unread messages per participant
    // Key: userId, Value: unreadCount
    private java.util.Map<String, Integer> unreadCounts = new java.util.HashMap<>();

    public Conversation() {
        // Required by Spring Data MongoDB
    }
    // Constructor for one-to-one conversation
    public Conversation(String user1Id, String user2Id) {
        this.participants.add(user1Id);
        this.participants.add(user2Id);
        this.type = "one_to_one";
        this.createdAt = LocalDateTime.now();
        this.lastMessageTimestamp = LocalDateTime.now(); // Initialize
    }
}