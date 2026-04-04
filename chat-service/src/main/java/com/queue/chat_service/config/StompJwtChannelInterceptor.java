package com.queue.chat_service.config;

import com.queue.chat_service.model.StompUserPrincipal;
import com.queue.chat_service.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;
import java.io.InputStream;
import java.security.KeyFactory;
import java.security.Principal;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Component
public class StompJwtChannelInterceptor implements ChannelInterceptor {
    @Autowired
    private JwtUtil jwtUtil; // reuse your existing logic
     private PublicKey publicKey;
    @PostConstruct
    public void init() {
        this.publicKey = loadPublicKeyFromClasspath("public_key.pem");
    }
     private PublicKey loadPublicKeyFromClasspath(String filename) {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(filename)) {
            if (is == null) throw new IllegalArgumentException("Public key file not found: " + filename);
            String pem = new String(is.readAllBytes());
            String clean = pem.replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", "") .replaceAll("\\s+", "");
            byte[] decoded = Base64.getDecoder().decode(clean);
            return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec (decoded));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
   @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                try {
                    String token = authHeader.substring(7);
                    // Claims claims = Jwts.parser().setSigningKey(publicKey).parseClaimsJws(token).getBody();
                    Claims claims = jwtUtil.validateAndGetClaims(token);
                    String userId = claims.get("userId", String.class);
                    System.out.println ("preSend Method:- checking the principle before userId "+ userId);
                    StompUserPrincipal principal = new StompUserPrincipal(userId);
                    System.out.println ("preSend Method :- checking  checking the principle after principle "+ principal);
                    // Set the user in the accessor
                    accessor.setUser(principal);
                    System.out.println ("preSend Method :- seeing the accessor after setting  "+ accessor);
                    // Force the principal into session attributes for persistence across frames
                    Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                    if (sessionAttributes == null) {
                        sessionAttributes = new HashMap<>();
                        accessor.setSessionAttributes(sessionAttributes);
                    }
                    sessionAttributes.put("user", principal);
                    System.out.println("preSend Method :- WS CONNECT Successful for user: " + userId);
                } catch (Exception e) {
                    System.out.println("preSend Method :- JWT Validation failed: " + e.getMessage());
                    return null; // Reject the connection
                }
            }
        }

        // Restore user for subsequent messages (SEND, SUBSCRIBE)
        if (accessor.getUser() == null) {
            Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
            if (sessionAttributes != null && sessionAttributes.containsKey("user")) {
                accessor.setUser((Principal) sessionAttributes.get("user"));
            }
        }

        return message;
    }
}