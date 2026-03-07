package com.queue.chat_service.websocket;

import com.queue.chat_service.security.CustomUserDetails;
import com.queue.chat_service.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class StompJwtChannelInterceptor implements ChannelInterceptor {

    @Autowired private JwtUtil jwtUtil;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> auth = accessor.getNativeHeader("Authorization");
            if (auth != null && !auth.isEmpty() && auth.get(0).startsWith("Bearer ")) {
                String token = auth.get(0).substring(7);
                Claims claims = jwtUtil.validateAndGetClaims(token);

                String userId = claims.get("userId", String.class);
                String phone = claims.getSubject();

                CustomUserDetails userDetails = new CustomUserDetails(userId, phone, List.of());
                // Principal name MUST be your userId so convertAndSendToUser(userId, ...) works
                accessor.setUser(() -> userDetails.getUserId());
            }
        }
        return message;
    }
}
