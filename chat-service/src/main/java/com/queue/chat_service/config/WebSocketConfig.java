package com.queue.chat_service.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .addInterceptors(new LoggingHandshakeInterceptor()) // ← Add this line
                .setAllowedOrigins("http://localhost:5500", "http://127.0.0.1:5500")
                .withSockJS();
    }
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");
        registry.enableSimpleBroker("/chatroom", "/user");
        registry.setUserDestinationPrefix("/user");
    }
/*
    @Bean
    public PublicKey buildPublicKey() {
        String pem =
                "-----BEGIN PUBLIC KEY----- MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjpDu4gI4qoGGspSSea8y pZV5VX5y4vnXZ2KfEc+WreKk+3hIzVG7M1BmX6vyqpvCFSuV5zzh8NHs+UieL1LK 8MViB0I62ILsv6NvOf7fy1pR3BtDqbj2/nmEpu/6tAilZXAXzj6TpvgHYrG4Q638 IA4BVwi9dvW7C1jWY4lJk8sd3yazELVIVcVDjgcp+FkVks6PVPYgvwp0oumkDp+G +EvM8jWU/NtLIL8aRb+PBWjl+27rCnfnEJYIinkJDf6hDr9zqyTncec8OTKs2mX8 CM0OT0vskZCsBF8ILgreaZDQgUP21Q61A2ImusUDQJiHtxs+eDl44qY6DVsvU/wK cQIDAQAB -----END PUBLIC KEY-----";

        String clean = pem
                .replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");

        byte[] decoded = Base64.getDecoder().decode(clean);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }

private PublicKey buildPublicKey() {
    try {
        String pem = """
                -----BEGIN PUBLIC KEY-----
                MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjpDu4gI4qoGGspSSea8y
                pZV5VX5y4vnXZ2KfEc+WreKk+3hIzVG7M1BmX6vyqpvCFSuV5zzh8NHs+UieL1LK
                8MViB0I62ILsv6NvOf7fy1pR3BtDqbj2/nmEpu/6tAilZXAXzj6TpvgHYrG4Q638
                IA4BVwi9dvW7C1jWY4lJk8sd3yazELVIVcVDjgcp+FkVks6PVPYgvwp0oumkDp+G
                +EvM8jWU/NtLIL8aRb+PBWjl+27rCnfnEJYIinkJDf6hDr9zqyTncec8OTKs2mX8
                CM0OT0vskZCsBF8ILgreaZDQgUP21Q61A2ImusUDQJiHtxs+eDl44qY6DVsvU/wK
                cQIDAQAB
                -----END PUBLIC KEY-----
                """;
        String pem = "-----BEGIN PUBLIC KEY----- MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjpDu4gI4qoGGspSSea8y pZV5VX5y4vnXZ2KfEc+WreKk+3hIzVG7M1BmX6vyqpvCFSuV5zzh8NHs+UieL1LK 8MViB0I62ILsv6NvOf7fy1pR3BtDqbj2/nmEpu/6tAilZXAXzj6TpvgHYrG4Q638 IA4BVwi9dvW7C1jWY4lJk8sd3yazELVIVcVDjgcp+FkVks6PVPYgvwp0oumkDp+G +EvM8jWU/NtLIL8aRb+PBWjl+27rCnfnEJYIinkJDf6hDr9zqyTncec8OTKs2mX8 CM0OT0vskZCsBF8ILgreaZDQgUP21Q61A2ImusUDQJiHtxs+eDl44qY6DVsvU/wK cQIDAQAB -----END PUBLIC KEY-----";


        String clean = pem.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s+", "");

        byte[] decoded = Base64.getDecoder().decode(clean);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    } catch (Exception e) {
        throw new RuntimeException("Failed to load public key", e);
    }
}



    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    String token = accessor.getFirstNativeHeader("Authorization");
                    System.out.println ("token in web config " + token);
                    if (token != null && token.startsWith("Bearer ")) {
                        token = token.substring(7);
                        System.out.println ("token in web config-->> " + token);
                        try {
                            Claims claims = Jwts.parser()
                                    .verifyWith(publicKey)
                                    .build()
                                    .parseSignedClaims(token)
                                    .getPayload();

                            System.out.println ("claims " + claims);
                            System.out.println ("userId "+ claims.getSubject());
                            System.out.println ("username "+ claims.getSubject());

                            accessor.getSessionAttributes().put("userId", claims.get("userId", String.class));
                            accessor.getSessionAttributes().put("phone", claims.get("phone", String.class));

                            System.out.println("✅ WebSocket CONNECT authenticated: " + claims.get("userId"));
                        } catch (Exception e) {
                            System.err.println("❌ Invalid token in WebSocket CONNECT");
                            throw new IllegalArgumentException("Invalid WebSocket token");
                        }
                    } else {
                        throw new IllegalArgumentException("Missing or invalid Authorization header in CONNECT");
                    }
                }

                return message;
            }
        });
    }
    */
}
