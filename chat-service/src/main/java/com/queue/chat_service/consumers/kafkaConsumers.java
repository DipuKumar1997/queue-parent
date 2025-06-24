//package com.queue.chat_service.consumers;
//
//import com.queue.chat_service.chat.ChatMessage;
//import com.queue.chat_service.websocket.ChatWebSocketHandler;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.stereotype.Component;
//
//@Component
//public class kafkaConsumers {
//    private final ChatWebSocketHandler chatWebSocketHandler;
//    Logger logger = LoggerFactory.getLogger(kafkaConsumers.class);
//
//    public kafkaConsumers(ChatWebSocketHandler chatWebSocketHandler) {
//        this.chatWebSocketHandler = chatWebSocketHandler;
//    }
//
//    @KafkaListener(topics = "chat_messages", groupId = "chat-service-group")
//    public void consume(ChatMessage message) {
//        logger.info("Received message from Kafka: {}", message);
//        try {
//            chatWebSocketHandler.sendToUser(message.getSenderId(), message); // or recipientId if you add it to ChatMessage
//        } catch (Exception e) {
//            logger.error("Error sending WebSocket message: {}", e.getMessage());
//        }
//    }
//
//}
