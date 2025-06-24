package com.queue.chat_service.repository;

import com.queue.chat_service.model.Message; // Ensure this import matches your Message model's package
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

// MessageRepository interface for Spring Data MongoDB
// It extends MongoRepository, specifying the Message model and its ID type (String)
public interface MessageRepository extends MongoRepository<Message, String> {

    /**
     * Finds all messages belonging to a specific conversation, ordered by their timestamp in ascending order.
     * This is crucial for displaying chat history chronologically.
     * @param conversationId The ID (String UUID) of the conversation.
     * @return A list of Message objects.
     */
    List<Message> findByConversationIdOrderByTimestampAsc(String conversationId);
}