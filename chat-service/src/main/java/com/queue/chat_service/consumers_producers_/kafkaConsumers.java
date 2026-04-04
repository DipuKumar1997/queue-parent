//package com.queue.chat_service.consumers_producers_;

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
//}
