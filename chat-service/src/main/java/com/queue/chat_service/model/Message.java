package com.queue.chat_service.model;

//package com.chat.app.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "messages")
public class Message {
    @Id
    private String id;
    @Indexed // Index for efficient retrieval of messages by conversation
    private String conversationId;

    private String senderId;
    private String recipientId; // Redundant if it's strictly one-to-one, but can be useful
    private String content;
    @Indexed // Index for sorting messages by time within a conversation
    private LocalDateTime timestamp;

    private String status; // e.g., "SENT", "DELIVERED", "READ"

    public Message(String conversationId, String senderId, String recipientId, String content) {
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.recipientId = recipientId;//who receive the message
        this.content = content;
        this.timestamp = LocalDateTime.now();
        this.status = "SENT";
    }
}