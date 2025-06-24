package com.queue.chat_service.contoller;

//import com.chat.app.model.Conversation;
//import com.chat.app.model.Message;
//import com.chat.app.service.MessageService;
import com.queue.chat_service.model.Conversation;
import com.queue.chat_service.model.Message;
//import com.queue.chat_service.service.AuthServiceProxy;
import com.queue.chat_service.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller; // Use @Controller for WebSocket endpoints, or @RestController if only REST
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller // Using @Controller because it contains @MessageMapping methods
@RequestMapping("/api/v1/chat") // Base path for REST endpoints
//@CrossOrigin(origins = "http://localhost:3000") // Allow your React app to connect
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // For sending messages to specific topics/users

    @Autowired
    private MessageService messageService;

    @GetMapping("/conversations")
    public ResponseEntity<List<Conversation>> getUserConversations() {
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        System.out.println("userId in conversations: " + userId);
        List<Conversation> conversations = messageService.getUserConversations(userId);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<Message>> getConversationMessages(@PathVariable String conversationId) {
        List<Message> messages = messageService.getMessagesByConversationId(conversationId);
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/conversation/one-to-one/{recipientId}")
    public ResponseEntity<Conversation> getOrCreateOneToOneConversation(
            @AuthenticationPrincipal String senderId,
            @PathVariable String recipientId) {
        Conversation conversation = messageService.getOrCreateOneToOneConversation(senderId, recipientId);
        return ResponseEntity.ok(conversation);
    }
    @PostMapping("/mark-read/{conversationId}")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable String conversationId,
            @AuthenticationPrincipal String readerId) {
        messageService.markMessagesAsRead(conversationId, readerId);
        return ResponseEntity.ok().build();
    }


    @MessageMapping("/chat.sendMessage") // STOMP destination: /app/chat.sendMessage
    public void sendMessage(@Payload Message chatMessage, @AuthenticationPrincipal String senderId) {
        System.out.println("Received message from WS. Sender: " + senderId +
                ", Recipient: " + chatMessage.getRecipientId() +
                ", Conv ID: " + chatMessage.getConversationId() +
                ", Content: " + chatMessage.getContent());

        Message savedMessage = messageService.saveMessage(
                chatMessage.getConversationId(),
                senderId, // Use the authenticated senderId from the token
                chatMessage.getRecipientId(),
                chatMessage.getContent()
        );

        messagingTemplate.convertAndSendToUser(
                savedMessage.getRecipientId(), "/queue/messages", savedMessage);
        messagingTemplate.convertAndSendToUser(
                savedMessage.getSenderId(), "/queue/messages", savedMessage); // Send back to sender for their own UI update
    }


    @MessageMapping("/chat.addUser") // STOMP destination: /app/chat.addUser
    public void addUser(@AuthenticationPrincipal String userId) {
        messageService.updateLastOnline(userId);
        System.out.println("User " + userId + " connected to WebSocket and is active.");
    }

}