//package com.queue.chat_service.chat;
//
//import com.queue.chat_service.enums.MessageStatus;
//import com.queue.chat_service.service.KafkaMessageProducer;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.SendTo;
//import org.springframework.web.bind.annotation.*;
//import lombok.RequiredArgsConstructor;
//import java.time.Instant;
//import java.util.UUID;
//@RestController
////@RequestMapping("/api/chat")
//@RequiredArgsConstructor
//public class chatController1 {
//    private final KafkaMessageProducer kafkaMessageProducer;
//    //localhost:8082/api/chat/send
//    @PostMapping("/send")
//    public ResponseEntity<String> sendMessage(@RequestBody ChatMessage message) {
//        // Basic validation and population of fields
//        if (message.getConversationId() == null || message.getConversationId().isEmpty() ||
//                message.getSenderId() == null || message.getSenderId().isEmpty() ||
//                message.getContent() == null || message.getContent().isEmpty()) {
//            return ResponseEntity.badRequest().body("Missing required message fields.");
//        }
//        // Generate ID and timestamp if not provided by client
//        if (message.getId() == null || message.getId().isEmpty()) {
//            message.setId(UUID.randomUUID().toString());
//       }
//        message.setTimestamp(Instant.now());
//        message.setStatus(MessageStatus.SENT); // Initial status
//        // Send the message to Kafka
//        kafkaMessageProducer.sendChatMessage(message);
//        return ResponseEntity.status(HttpStatus.ACCEPTED).body("Message sent to Kafka for processing.");
//    }
//    // You would add other REST endpoints here for chat history, creating conversations, etc.
//    // As per our earlier discussion on microservice design.
//}