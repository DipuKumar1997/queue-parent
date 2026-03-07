package com.queue.chat_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.io.InputStream;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


    private PublicKey publicKey;

    @PostConstruct
    public void init() {
        this.publicKey = loadPublicKeyFromClasspath("public_key.pem");
    }

    private PublicKey loadPublicKeyFromClasspath(String filename) {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(filename)) {
            if (is == null) {
                throw new IllegalArgumentException("Public key file not found in classpath: " + filename);
            }
            String pem = new String(is.readAllBytes());
            String clean = pem.replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s+", "");

            byte[] decoded = Base64.getDecoder().decode(clean);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
            return KeyFactory.getInstance("RSA").generatePublic(spec);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load public key from classpath", e);
        }
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
//                .addInterceptors(new LoggingHandshakeInterceptor())
                .setAllowedOriginPatterns("https://yourfrontend.com", "http://localhost:3000")
                .withSockJS();
    }

//    @Override
//    public void configureMessageBroker(MessageBrokerRegistry registry) {
//        registry.setApplicationDestinationPrefixes("/app");
//        registry.enableSimpleBroker("/chatroom", "/user");
//        registry.setUserDestinationPrefix("/user");
//    }
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/queue", "/topic");
        registry.setUserDestinationPrefix("/user");
    }


//    @Override
//    public void configureClientInboundChannel(ChannelRegistration registration) {
//        registration.interceptors(new ChannelInterceptor() {
//            @Override
//            public Message<?> preSend(Message<?> message, MessageChannel channel) {
//                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
//
//                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
//                    String authHeader = accessor.getFirstNativeHeader("Authorization");
//
//                    if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//                        throw new IllegalArgumentException("Missing or invalid Authorization header in CONNECT");
//                    }
//
//                    String token = authHeader.substring(7);
//                    try {
//                        Claims claims = Jwts.parser()
//                                .verifyWith(publicKey)
//                                .build()
//                                .parseSignedClaims(token)
//                                .getPayload();
//
//                        String userId = claims.get("userId", String.class);
////                        accessor.setUser(new UsernamePasswordAuthenticationToken(userId, null, List.of()));
//                        accessor.setUser(() -> userId);
//
//                        System.out.println(" WebSocket CONNECT authenticated for userId: " + userId);
//                    } catch (Exception e) {
//                        System.err.println(" JWT validation failed during WebSocket CONNECT: " + e.getMessage());
//                        throw new IllegalArgumentException("Invalid WebSocket token");
//                    }
//                }
//
//                return message;
//            }
//        });
//    }

@Override
public void configureClientInboundChannel(ChannelRegistration registration) {
    registration.interceptors(new ChannelInterceptor() {
        @Override
        public Message<?> preSend(Message<?> message, MessageChannel channel) {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String authHeader = accessor.getFirstNativeHeader("Authorization");
                System.out.println("CONNECT Authorization header websocketconfig class = " + authHeader);
                if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                    throw new IllegalArgumentException("Missing Authorization header");
                }

                String token = authHeader.substring(7);
                Claims claims = Jwts.parser()
                        .verifyWith(publicKey)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                String userId = claims.get("userId", String.class);
                if (userId == null || userId.isBlank()) {
                    throw new IllegalArgumentException("userId missing in token");
                }

                // IMPORTANT: make Principal.getName() == userId
                System.out.println("CONNECT userId in websocketconfig= " + userId);
                accessor.setUser(() -> userId);
            }

            return message;
        }
    });
}


}
