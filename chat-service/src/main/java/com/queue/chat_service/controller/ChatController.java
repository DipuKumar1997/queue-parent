package com.queue.chat_service.controller;

import com.queue.chat_service.model.Conversation;
import com.queue.chat_service.model.Message;
import com.queue.chat_service.security.CustomUserDetails;
import com.queue.chat_service.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@Controller
@RequestMapping("/api/v1/chat")
public class ChatController {

    @Autowired private SimpMessagingTemplate messagingTemplate;
    @Autowired private MessageService messageService;

    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<Message>> getConversationMessages(@PathVariable String conversationId) {
        return ResponseEntity.ok(messageService.getMessagesByConversationId(conversationId));
    }

    @PostMapping("/conversation/one-to-one/{recipientId}")
    public ResponseEntity<Conversation> getOrCreateOneToOneConversation( @AuthenticationPrincipal CustomUserDetails principal,  @PathVariable String recipientId) {
        if (principal == null) return ResponseEntity.status(401).build();
        String senderId = principal.getUserId();
        return ResponseEntity.ok(messageService.getOrCreateOneToOneConversation(senderId, recipientId));
    }

    // Client must NOT send senderId; server derives it from Principal
    public static class SendMessagePayload {
        public String conversationId;
        public String recipientId;
        public String content;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload SendMessagePayload payload, Principal principal) { //StompUserPrincipal
        System.out.println ("sendMessage METHOD :-  seeing the principle "+ principal);
        if (principal == null) {
                System.out.println(" Principal is NULL in Controller");
                return;
        }   // unauthenticated WS session
        System.out.println("sendMessage METHOD :- WS sendMessage called, principal=" + (principal==null?null:principal.getName()));
        System.out.println("sendMessage METHOD :- payload=" + payload.conversationId + " payload.recipientId " + payload.recipientId + "  payload.content " + payload.content);

        String senderId = principal.getName(); // we will set this to userId in WS auth interceptor

        Message saved = messageService.saveMessage( payload.conversationId,   senderId,  payload.recipientId, payload.content );
        System.out.println (" sendMessage METHOD :- saved.getId() "+ saved.getId ());
        // private to private: only these two users get it
        messagingTemplate.convertAndSendToUser(saved.getRecipientId(), "/queue/messages", saved);
        messagingTemplate.convertAndSendToUser(saved.getSenderId(), "/queue/messages", saved);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(Principal principal) {
        if (principal == null) return;
        String userId = principal.getName();
        messageService.updateLastOnline(userId);
    }
}