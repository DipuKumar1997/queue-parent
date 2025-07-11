//package com.queue.chat_service.controller;
//
////import com.chat.app.model.Conversation;
////import com.chat.app.model.Message;
////import com.chat.app.service.MessageService;
//import com.queue.chat_service.model.Conversation;
//import com.queue.chat_service.model.Message;
////import com.queue.chat_service.service.AuthServiceProxy;
//import com.queue.chat_service.service.MessageService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.Payload;
//import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.stereotype.Controller; // Use @Controller for WebSocket endpoints, or @RestController if only REST
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@Controller // Using @Controller because it contains @MessageMapping methods
//@RequestMapping("/api/v1/chat") // Base path for REST endpoints
////@CrossOrigin(origins = "http://localhost:3000") // Allow your React app to connect
//public class ChatController {
//
//    @Autowired
//    private SimpMessagingTemplate messagingTemplate; // For sending messages to specific topics/users
//
//    @Autowired
//    private MessageService messageService;
//
//    @GetMapping("/conversations")
//    public ResponseEntity<List<Conversation>> getUserConversations() {
//        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//        System.out.println("userId in conversations: " + userId);
//        List<Conversation> conversations = messageService.getUserConversations(userId);
//        return ResponseEntity.ok(conversations);
//    }
//
//    @GetMapping("/messages/{conversationId}")
//    public ResponseEntity<List<Message>> getConversationMessages(@PathVariable String conversationId) {
//        List<Message> messages = messageService.getMessagesByConversationId(conversationId);
//        return ResponseEntity.ok(messages);
//    }
//
//    //only to save in thw Conversation document the Conversation id
//    @PostMapping("/conversation/one-to-one/{recipientId}")
//    public ResponseEntity<Conversation> getOrCreateOneToOneConversation(
//            @AuthenticationPrincipal String senderId,
//            @PathVariable String recipientId) {
//        Conversation conversation = messageService.getOrCreateOneToOneConversation(senderId, recipientId);
//        return ResponseEntity.ok(conversation);
//    }
//    @PostMapping("/mark-read/{conversationId}")
//    public ResponseEntity<Void> markMessagesAsRead(
//            @PathVariable String conversationId,
//            @AuthenticationPrincipal String readerId) {
//        messageService.markMessagesAsRead(conversationId, readerId);
//        return ResponseEntity.ok().build();
//    }
//
//
//    //@AuthenticationPrincipal String senderId
//    @MessageMapping("/chat.sendMessage") // STOMP destination: /app/chat.sendMessage
//    public void sendMessage(@Payload Message chatMessage, @AuthenticationPrincipal String userId) {
////        String senderId = (String) headerAccessor.getSessionAttributes().get("userId");
////        String phone = (String) headerAccessor.getSessionAttributes().get("phone");
//        System.out.println("Received message from WS. Sender: " + userId +
//                ", Recipient: " + chatMessage.getRecipientId() +
//                ", Conv ID: " + chatMessage.getConversationId() +
//                ", Content: " + chatMessage.getContent());
//        System.out.println ("-------------------------------------------------------");
//        System.out.println("Principal in sendMessage: " + userId);
//        System.out.println ("-------------------------------------------------------");
////        String senderIdd = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
////        System.out.println ("senderIdd         --->>>> " + senderIdd);
//        System.out.println("SecurityContextHolder: " + SecurityContextHolder.getContext().getAuthentication());
//        System.out.println ("-------------------------------------------------------");
//
//        Message savedMessage = messageService.saveMessage(
//                chatMessage.getConversationId(),
//                userId, // Use the authenticated senderId from the token
//                chatMessage.getRecipientId(),
//                chatMessage.getContent()
//        );
//
//        messagingTemplate.convertAndSendToUser(
//                savedMessage.getRecipientId(), "/queue/messages", savedMessage);
//        messagingTemplate.convertAndSendToUser(
//                savedMessage.getSenderId(), "/queue/messages", savedMessage); // Send back to sender for their own UI update
//    }
//
//
//    @MessageMapping("/chat.addUser") // STOMP destination: /app/chat.addUser
//    public void addUser(@AuthenticationPrincipal String userId) {
//        messageService.updateLastOnline(userId);
//        System.out.println("User " + userId + " connected to WebSocket and is active.");
//    }
//
//}
//
//
//package com.queue.chat_service.controller; // Note: Potential typo, usually 'controller'
//
//import com.queue.chat_service.model.Conversation;
//import com.queue.chat_service.model.Message;
//import com.queue.chat_service.service.MessageService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.messaging.handler.annotation.MessageMapping;
//import org.springframework.messaging.handler.annotation.Payload;
//import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
//import org.springframework.messaging.simp.SimpMessagingTemplate;
//import org.springframework.security.core.annotation.AuthenticationPrincipal;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.UserDetails; // Import UserDetails
//import org.springframework.stereotype.Controller;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@Controller // Using @Controller because it contains @MessageMapping methods
//@RequestMapping("/api/v1/chat") // Base path for REST endpoints
////@CrossOrigin(origins = "http://localhost:3000") // Allow your React app to connect (uncomment if needed)
//public class ChatController {
//
//    @Autowired
//    private SimpMessagingTemplate messagingTemplate; // For sending messages to specific topics/users
//
//    @Autowired
//    private MessageService messageService;
//
//    // REST endpoint to get user conversations
//    @GetMapping("/conversations")
//    public ResponseEntity<List<Conversation>> getUserConversations() {
//        // Retrieve the authenticated principal
//        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//        String userId;
//
//        // Check if the principal is a UserDetails object (as set by our TokenAuthenticationFilter/ChannelInterceptor)
//        if (principal instanceof UserDetails) {
//            userId = ((UserDetails) principal).getUsername();
//        } else if (principal instanceof String) {
//            // Fallback for cases where a String principal might be set (e.g., "anonymousUser" or a raw userId string)
//            userId = (String) principal;
//        } else {
//            // Handle unauthenticated or unexpected principal type
//            System.err.println("ERROR: Unauthenticated user trying to access conversations or unexpected principal type: " + principal.getClass().getName());
//            return ResponseEntity.status(401).build(); // Unauthorized
//        }
//
//        System.out.println("userId in conversations (from SecurityContextHolder): " + userId);
//        List<Conversation> conversations = messageService.getUserConversations(userId);
//        return ResponseEntity.ok(conversations);
//    }
//
//    // REST endpoint to get messages for a specific conversation
//    @GetMapping("/messages/{conversationId}")
//    public ResponseEntity<List<Message>> getConversationMessages(@PathVariable String conversationId) {
//        List<Message> messages = messageService.getMessagesByConversationId(conversationId);
//        return ResponseEntity.ok(messages);
//    }
//
//    // REST endpoint to get or create a one-to-one conversation
//    @PostMapping("/conversation/one-to-one/{recipientId}")
//    public ResponseEntity<Conversation> getOrCreateOneToOneConversation(
//            @AuthenticationPrincipal UserDetails principal, // Use UserDetails
//            @PathVariable String recipientId) {
//
//        String senderId = null;
//        if (principal != null) {
//            senderId = principal.getUsername();
//        } else {
//            System.err.println("ERROR: @AuthenticationPrincipal is null for getOrCreateOneToOneConversation.");
//            return ResponseEntity.status(401).build(); // Unauthorized
//        }
//
//        Conversation conversation = messageService.getOrCreateOneToOneConversation(senderId, recipientId);
//        return ResponseEntity.ok(conversation);
//    }
//
//    // REST endpoint to mark messages as read
//    @PostMapping("/mark-read/{conversationId}")
//    public ResponseEntity<Void> markMessagesAsRead(
//            @PathVariable String conversationId,
//            @AuthenticationPrincipal UserDetails principal) { // Use UserDetails
//
//        String readerId = null;
//        if (principal != null) {
//            readerId = principal.getUsername();
//        } else {
//            System.err.println("ERROR: @AuthenticationPrincipal is null for markMessagesAsRead.");
//            return ResponseEntity.status(401).build(); // Unauthorized
//        }
//
//        messageService.markMessagesAsRead(conversationId, readerId);
//        return ResponseEntity.ok().build();
//    }
//
//
//    // WebSocket endpoint for sending chat messages
//    @MessageMapping("/chat.sendMessage") // STOMP destination: /app/chat.sendMessage
//    public void sendMessage(@Payload Message chatMessage,
//                            SimpMessageHeaderAccessor headerAccessor, // Keep for accessing session attributes if needed
//                            @AuthenticationPrincipal UserDetails principal) { // Get authenticated user's details
//
//        String senderId = null;
//        if (principal != null) {
//            senderId = principal.getUsername(); // This is the userId we set in WebSocketSecurityConfig
//        }
//
//        if (senderId == null || senderId.equals("anonymousUser")) {
//            System.err.println("ERROR: Message received from unauthenticated or anonymous user. Cannot save message.");
//            // You might want to send an error message back to the client here
//            // messagingTemplate.convertAndSendToUser(headerAccessor.getSessionId(), "/queue/errors", "Authentication required to send messages.");
//            return;
//        }
//
//        System.out.println("Received message from WS. Sender: " + senderId +
//                ", Recipient: " + chatMessage.getRecipientId() +
//                ", Conv ID: " + chatMessage.getConversationId() +
//                ", Content: " + chatMessage.getContent());
//        System.out.println ("-------------------------------------------------------");
//        System.out.println("Principal in sendMessage (from @AuthenticationPrincipal): " + senderId);
//        System.out.println ("-------------------------------------------------------");
//        System.out.println("SecurityContextHolder Authentication: " + SecurityContextHolder.getContext().getAuthentication());
//        System.out.println ("-------------------------------------------------------");
//
//        Message savedMessage = messageService.saveMessage(
//                chatMessage.getConversationId(),
//                senderId, // Use the authenticated senderId
//                chatMessage.getRecipientId(),
//                chatMessage.getContent()
//        );
//
//        // Send message to recipient's queue
//        messagingTemplate.convertAndSendToUser(
//                savedMessage.getRecipientId(), "/queue/messages", savedMessage);
//        // Send message back to sender's queue for their own UI update
//        messagingTemplate.convertAndSendToUser(
//                savedMessage.getSenderId(), "/queue/messages", savedMessage);
//    }
//
//
//    // WebSocket endpoint for adding user to active connections (e.g., for online status)
//    @MessageMapping("/chat.addUser") // STOMP destination: /app/chat.addUser
//    public void addUser(@AuthenticationPrincipal UserDetails principal) { // Get authenticated user's details
//        String userId = null;
//        if (principal != null) {
//            userId = principal.getUsername();
//        }
//
//        if (userId == null || userId.equals("anonymousUser")) {
//            System.err.println("ERROR: Add user request from unauthenticated or anonymous user.");
//            return;
//        }
//
//        messageService.updateLastOnline(userId);
//        System.out.println("User " + userId + " connected to WebSocket and is active.");
//    }
//}

package com.queue.chat_service.controller; // Note: Potential typo, usually 'controller'

import com.queue.chat_service.model.Conversation;
import com.queue.chat_service.model.Message;
//import com.queue.chat_service.service.MessageService;
import com.queue.chat_service.security.CustomUserDetails;
import com.queue.chat_service.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails; // Import UserDetails
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping("/api/v1/chat")
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // For sending messages to specific topics/users

    @Autowired
    private MessageService messageService;
//
//    // REST endpoint to get user conversations
//    @GetMapping("/conversations")
//    public ResponseEntity<List<Conversation>> getUserConversations() {
//        // Retrieve the authenticated principal
//        Object principalObject = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
//        String userId;
//
//        // Ensure the principal is a UserDetails object as set by our filters
//        if (principalObject instanceof UserDetails) {
//            userId = ((UserDetails) principalObject).getUsername();
//        } else {
//            // Fallback for cases where a String principal might be set (e.g., "anonymousUser")
//            // Or handle unauthenticated/unexpected principal type
//            System.err.println("ERROR: Principal in SecurityContextHolder is not UserDetails for /conversations: " + principalObject.getClass().getName() + " -> " + principalObject.toString());
//            if (principalObject instanceof String) {
//                userId = (String) principalObject; // Will likely be "anonymousUser" if auth failed
//            } else {
//                return ResponseEntity.status(401).build(); // Unauthorized
//            }
//        }
//
//        System.out.println("userId in conversations (from SecurityContextHolder): " + userId);
//        if ("anonymousUser".equals(userId)) {
//            return ResponseEntity.status(401).build(); // Explicitly reject anonymous access
//        }
//        List<Conversation> conversations = messageService.getUserConversations(userId);
//        return ResponseEntity.ok(conversations);
//    }
//
    // REST endpoint to get messages for a specific conversation
    @GetMapping("/messages/{conversationId}")
    public ResponseEntity<List<Message>> getConversationMessages(@PathVariable String conversationId) {
        List<Message> messages = messageService.getMessagesByConversationId(conversationId);
        return ResponseEntity.ok(messages);
    }
//
//    // REST endpoint to get or create a one-to-one conversation
    @PostMapping("/conversation/one-to-one/{recipientId}")
    public ResponseEntity<Conversation> getOrCreateOneToOneConversation(
            @AuthenticationPrincipal CustomUserDetails principal,// <--- CHANGED TO UserDetails
            @PathVariable String recipientId) {

        // Debugging: Check SecurityContextHolder content immediately at method entry
        System.out.println("Debugging getOrCreateOneToOneConversation: SecurityContextHolder Authentication: " + SecurityContextHolder.getContext().getAuthentication());

        String senderId = null;
        if (principal != null) {
            senderId = principal.getUserId (); // Get the userId from UserDetails
        } else {
            System.err.println("ERROR: @AuthenticationPrincipal is null for getOrCreateOneToOneConversation. This means authentication failed.");
            return ResponseEntity.status(401).build(); // Unauthorized
        }

        // Additional check for "anonymousUser" if it gets through
        if ("anonymousUser".equals(senderId)) {
            System.err.println("ERROR: Anonymous user trying to create conversation.");
            return ResponseEntity.status(401).build(); // Unauthorized
        }

        Conversation conversation = messageService.getOrCreateOneToOneConversation(senderId, recipientId);
        return ResponseEntity.ok(conversation);
    }

//    // REST endpoint to mark messages as read
//    @PostMapping("/mark-read/{conversationId}")
//    public ResponseEntity<Void> markMessagesAsRead(@PathVariable String conversationId, @AuthenticationPrincipal UserDetails principal) { // <--- CHANGED TO UserDetails
//
//        String readerId = null;
//        if (principal != null) {
//            readerId = principal.getUsername(); // Get the userId from UserDetails
//        } else {
//            System.err.println("ERROR: @AuthenticationPrincipal is null for markMessagesAsRead. This means authentication failed.");
//            return ResponseEntity.status(401).build(); // Unauthorized
//        }
//
//        if ("anonymousUser".equals(readerId)) {
//            System.err.println("ERROR: Anonymous user trying to mark messages as read.");
//            return ResponseEntity.status(401).build(); // Unauthorized
//        }
//
//        messageService.markMessagesAsRead(conversationId, readerId);
//        return ResponseEntity.ok().build();
//    }

    /*
    @MessageMapping("/chat.sendMessage") // STOMP destination: /app/chat.sendMessage
    public void sendMessage(@Payload Message chatMessage) { // <--- CHANGED TO UserDetails
        Message savedMessage = messageService.saveMessage(
                chatMessage.getConversationId(),
                chatMessage.getSenderId (), // Use the authenticated senderId
                chatMessage.getRecipientId(),
                chatMessage.getContent()
        );
        // Send to recipient only
        messagingTemplate.convertAndSendToUser( savedMessage.getRecipientId(), "/queue/messages", savedMessage);
        System.out.println ("----------------------------");
        System.out.println (savedMessage.getSenderId() + " : " + savedMessage.getContent());
        System.out.println ("----------------------------");
        // Send to sender for UI update (ONLY ONCE)
        messagingTemplate.convertAndSendToUser(savedMessage.getSenderId(), "/queue/messages", savedMessage);
//        messagingTemplate.convertAndSendToUser( savedMessage.getSenderId(), "/queue/messages", savedMessage);
//        messagingTemplate.convertAndSend("/user/" + savedMessage.getSenderId() + "/queue/messages", savedMessage);
    }
*/
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload Message chatMessage,
                            @AuthenticationPrincipal String authenticatedUserId) {

        Message savedMessage = messageService.saveMessage(
                chatMessage.getConversationId(),
                authenticatedUserId, // <- SECURE source of senderId
                chatMessage.getRecipientId(),
                chatMessage.getContent()
        );
        // Send to recipient
        messagingTemplate.convertAndSendToUser(savedMessage.getRecipientId(), "/queue/messages", savedMessage);
        System.out.println("----------------------------");
        System.out.println(savedMessage.getSenderId() + " : " + savedMessage.getContent());
        System.out.println("----------------------------");

        // Send back to sender for UI update
        messagingTemplate.convertAndSendToUser(savedMessage.getSenderId(), "/queue/messages", savedMessage);
    }



    // WebSocket endpoint for adding user to active connections (e.g., for online status)
    @MessageMapping("/chat.addUser") // STOMP destination: /app/chat.addUser
    public void addUser(@AuthenticationPrincipal UserDetails principal) { // <--- CHANGED TO UserDetails
        String userId = null;
        if (principal != null) {
            userId = principal.getUsername();
        }

        if (userId == null || userId.equals("anonymousUser")) {
            System.err.println("ERROR: Add user request from unauthenticated or anonymous user.");
            return;
        }

        messageService.updateLastOnline(userId);
        System.out.println("User " + userId + " connected to WebSocket and is active.");
    }
}






























 /*
     messagingTemplate.convertAndSendToUser(
//                savedMessage.getRecipientId(), "/private", savedMessage);
        // Send to recipient
//        messagingTemplate.convertAndSend(
//                "/user/" + savedMessage.getRecipientId() + "/queue/messages", savedMessage
//        );
//
//        // Send to sender
//        messagingTemplate.convertAndSend(
//                "/user/" + savedMessage.getSenderId() + "/queue/messages", savedMessage
//        );
  */
        //        String senderId = null;
        //        if (principal != null) {
        //            senderId = principal.getUsername(); // This is the userId we set in WebSocketSecurityConfig
        //        }

        //        if (senderId == null || senderId.equals("anonymousUser")) {
        //            System.err.println("ERROR: Message received from unauthenticated or anonymous user. Cannot save message.");
        //            // You might want to send an error message back to the client here
        //            // messagingTemplate.convertAndSendToUser(headerAccessor.getSessionId(), "/queue/errors", "Authentication required to send messages.");
        //            return;
        //        }


        // WebSocket endpoint for sending chat messages
        // SimpMessageHeaderAccessor headerAccessor, // Keep for accessing session attributes if needed
        //                            @AuthenticationPrincipal UserDetails principal


        ///

//         System.out.println("Received message from WS. Sender: " + senderId +
//                ", Recipient: " + chatMessage.getRecipientId() +
//                ", Conv ID: " + chatMessage.getConversationId() +
//                ", Content: " + chatMessage.getContent());
//        System.out.println ("-------------------------------------------------------");
//        System.out.println("Principal in sendMessage (from @AuthenticationPrincipal): " + senderId);
//        System.out.println ("-------------------------------------------------------");
//        System.out.println("SecurityContextHolder Authentication: " + SecurityContextHolder.getContext().getAuthentication());
//        System.out.println ("-------------------------------------------------------");
//  */
