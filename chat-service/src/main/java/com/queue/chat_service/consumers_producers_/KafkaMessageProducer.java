/*
package com.queue.chat_service.service;

@Service
@RequiredArgsConstructor // Lombok annotation to generate a constructor for final fields
public class KafkaMessageProducer {

    private static final Logger logger = LoggerFactory.getLogger(KafkaMessageProducer.class);
    private static final String CHAT_TOPIC = "chat_messages"; // The Kafka topic name

    private final KafkaTemplate<String, ChatMessage> kafkaTemplate;

    public void sendChatMessage(ChatMessage message) {
        logger.info("Sending message: {} to topic {}", message, CHAT_TOPIC);
        // The message ID (or conversationId) can be used as the Kafka key for ordering
        kafkaTemplate.send(CHAT_TOPIC, message.getConversationId(), message)
                .whenComplete((result, ex) -> {
                    if (ex == null) {
                        logger.info("Message sent successfully to topic {}. Offset: {}",
                                result.getRecordMetadata().topic(),
                                result.getRecordMetadata().offset());
                    } else {
                        logger.error("Failed to send message to topic {}. Error: {}", CHAT_TOPIC, ex.getMessage());
                    }
                });
    }
}
*/
