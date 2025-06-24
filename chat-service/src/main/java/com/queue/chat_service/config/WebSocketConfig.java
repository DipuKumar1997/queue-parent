package com.queue.chat_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // Enables WebSocket message handling
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // This is the endpoint for WebSocket connection (e.g., ws://localhost:8080/ws)
        // `setAllowedOriginPatterns` is for CORS. `withSockJS()` provides fallback options.
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // `enableSimpleBroker` enables a simple in-memory broker
        // Messages to destinations starting with `/queue` or `/topic` are routed to clients
        registry.enableSimpleBroker("/queue", "/topic");

        // `setApplicationDestinationPrefixes` sets a prefix for messages that are
        // bound for methods annotated with @MessageMapping (e.g., /app/chat.sendMessage)
        registry.setApplicationDestinationPrefixes("/app");
    }
}