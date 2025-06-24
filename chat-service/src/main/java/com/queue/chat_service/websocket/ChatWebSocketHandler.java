//package com.queue.chat_service.websocket;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.queue.chat_service.chat.ChatMessage;
//import com.queue.chat_service.service.KafkaMessageProducer;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Component;
//import org.springframework.web.socket.*;
//import org.springframework.web.socket.handler.TextWebSocketHandler;
//
//import java.util.Map;
//import java.util.concurrent.ConcurrentHashMap;
//
//@Component
//@RequiredArgsConstructor
//public class ChatWebSocketHandler extends TextWebSocketHandler {
//
//    private final KafkaMessageProducer kafkaMessageProducer;
//    private final ObjectMapper objectMapper = new ObjectMapper();
//    private final Map<String, WebSocketSession> activeSessions = new ConcurrentHashMap<>();
//
//    @Override
//    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
//        String userId = getUserIdFromSession(session);
//        if (userId != null) {
//            activeSessions.put(userId, session);
//            System.out.println("User connected: " + userId);
//        }
//    }
//
//    @Override
//    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
//        ChatMessage chatMessage = objectMapper.readValue(message.getPayload(), ChatMessage.class);
//        kafkaMessageProducer.sendChatMessage(chatMessage);
//    }
//
//    @Override
//    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
//        activeSessions.values().remove(session);
//    }
//
//    public void sendToUser(String userId, ChatMessage message) throws Exception {
//        WebSocketSession session = activeSessions.get(userId);
//        if (session != null && session.isOpen()) {
//            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(message)));
//        }
//    }
//
//    private String getUserIdFromSession(WebSocketSession session) {
//        // Example: extract userId from query params or headers
//        String uri = session.getUri().toString();
//        if (uri.contains("userId=")) {
//            return uri.split("userId=")[1];
//        }
//        return null;
//    }
//}
