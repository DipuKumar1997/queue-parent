////package com.queue.chat_service.config;
////
//////import com.chat.app.service.AuthServiceProxy;
////import com.chat.app.service.MessageService;
////import com.chat.app.service.WebSocketSessionManager;
//import com.queue.chat_service.service.AuthServiceProxy;
//import com.queue.chat_service.service.MessageService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.context.event.EventListener;
//import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.stereotype.Component;
//import org.springframework.web.socket.messaging.SessionConnectEvent;
//import org.springframework.web.socket.messaging.SessionDisconnectEvent;
//
//@Component
////public class WebSocketSessionEventListener {
////
////    @Autowired
////    private WebSocketSessionManager sessionManager;
////
////    @Autowired
//////    private AuthServiceProxy authServiceProxy; // Inject AuthServiceProxy for remote validation
////
////    @Autowired
////    private MessageService messageService; // To update user status
////
////    /**
////     * Handles WebSocket session connection events.
////     * Extracts and validates the JWT from handshake headers to authenticate the user.
////     */
////    @EventListener
////    public void handleWebSocketConnectListener(SessionConnectEvent event) {
////        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
////        String sessionId = headers.getSessionId();
////        // Expecting "Bearer <token>" from a native header named "Authorization"
////        String authHeader = (String) headers.getFirstNativeHeader("Authorization");
////
////        String userId = null;
////        if (authHeader != null && authHeader.startsWith("Bearer ")) {
////            String jwtToken = authHeader.substring(7); // Remove "Bearer " prefix
////
////            // Call Auth Service to validate the token
//////            AuthServiceProxy.TokenValidationResponse validationResponse = authServiceProxy.validateToken(jwtToken);
////
////            if (validationResponse != null && validationResponse.isValid()) {
////                userId = validationResponse.getUserId(); // Get the UUID (JTI) from Auth Service
////                String phone = validationResponse.getPhone(); // Get the phone from Auth Service
////                String username = validationResponse.getUsername(); // Get username from Auth Service (optional)
////
////                // Provision the user in chat service's MongoDB if they don't exist, or update details
////                messageService.provisionChatUser(userId, username != null ? username : phone, phone);
////
////                // Set authentication in the WebSocket session's SecurityContext.
////                // This makes the user's ID available via @AuthenticationPrincipal in @MessageMapping methods.
////                UsernamePasswordAuthenticationToken authentication =
////                        new UsernamePasswordAuthenticationToken(userId, null, null); // Principal is userId (UUID string)
////                headers.setUser(authentication); // This is crucial for @AuthenticationPrincipal
////
////                sessionManager.addSession(userId, sessionId); // Register session
////                messageService.updateLastOnline(userId); // Mark user as online
////                System.out.println("User " + userId + " connected to WebSocket. Session: " + sessionId);
////            } else {
////                // Token invalid or expired according to Auth Service
////                System.err.println("Invalid or expired token during WebSocket connect for session: " + sessionId + ". Authentication failed.");
////            }
////        } else {
////            System.err.println("No Authorization header found or malformed during WebSocket connect for session: " + sessionId + ". Connection denied.");
////            // Optionally, you can send an error frame or close the connection explicitly here.
////        }
////    }
////
////    /**
////     * Handles WebSocket session disconnection events.
////     * Removes the session and updates the user's last online status.
////     */
////    @EventListener
////    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
////        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
////        String sessionId = headers.getSessionId();
////        String userId = sessionManager.getUserId(sessionId); // Get userId before removing session mapping
////
////        sessionManager.removeSession(sessionId); // Remove session mapping
////        if (userId != null) {
////            // Optional: You might want to delay setting user offline or check if they have other active sessions
////            // For simplicity, we update lastOnline immediately
////            messageService.updateLastOnline(userId); // Mark user as offline/update last seen
////            System.out.println("User " + userId + " disconnected from WebSocket. Session: " + sessionId);
////        }
////    }
////}

package com.queue.chat_service.config;

import com.queue.chat_service.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
public class WebSocketSessionEventListener {

    @Autowired
    private WebSocketSessionManager sessionManager;

    @Autowired
    private MessageService messageService;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();

        // ✅ Extract user info from API Gateway injected headers
        String userId = headers.getFirstNativeHeader("X-User-Id");
        String phone = headers.getFirstNativeHeader("X-User-Phone");
        String username = headers.getFirstNativeHeader("X-User-Username");

        if (userId != null) {
            // ✅ Provision user if needed
            messageService.provisionChatUser(userId,
                    (username != null && !username.isEmpty()) ? username : phone,
                    phone);

            // ✅ Set authentication context
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, null);
            headers.setUser(authentication);

            // ✅ Register session
            sessionManager.addSession(userId, sessionId);
            messageService.updateLastOnline(userId);

            System.out.println("✅ User " + userId + " connected to WebSocket. Session: " + sessionId);
        } else {
            // ❌ No userId — reject connection or log error
            System.err.println("❌ WebSocket connection denied. Missing X-User-Id header. Session: " + sessionId);
            // You could force close the connection or send an error frame if needed
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor headers = SimpMessageHeaderAccessor.wrap(event.getMessage());
        String sessionId = headers.getSessionId();

        String userId = sessionManager.getUserId(sessionId);
        sessionManager.removeSession(sessionId);

        if (userId != null) {
            messageService.updateLastOnline(userId);
            System.out.println("ℹ️ User " + userId + " disconnected from WebSocket. Session: " + sessionId);
        }
    }
}
