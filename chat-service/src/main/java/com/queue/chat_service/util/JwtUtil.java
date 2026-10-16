package com.queue.chat_service.util;

import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.*;
import org.springframework.stereotype.Component;
import java.io.InputStream;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Component
public class JwtUtil {
    /*
        private final PublicKey publicKey;
        public JwtUtil() {
            this.publicKey = loadPublicKeyFromClasspath("public_key.pem");
        }
        private PublicKey loadPublicKeyFromClasspath(String fileName) {
            try (InputStream is = getClass().getClassLoader().getResourceAsStream(fileName)) {
                if (is == null) throw new RuntimeException("public_key.pem not found in classpath");
                String pem = new String(is.readAllBytes());
                String cleaned = pem.replace("-----BEGIN PUBLIC KEY-----", "").replace("-----END PUBLIC KEY-----", "").replaceAll("\\s+", "");
                byte[] decoded = Base64.getDecoder().decode(cleaned);
                return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(decoded));
            } catch (Exception e) {
                throw new RuntimeException("Failed to load public key", e);
            }
        }
    */
    private final PublicKey publicKey;

    public JwtUtil(@Value("${JWT_PUBLIC_KEY:}") String ssmPublicKey) {
        if (ssmPublicKey != null && !ssmPublicKey.isBlank()) {
            this.publicKey = parsePublicKey(ssmPublicKey);
        } else {
            this.publicKey = loadPublicKeyFromClasspath("public_key.pem");
        }
    }

    private PublicKey parsePublicKey(String pemContent) {
        try {
            String cleaned = pemContent
                    .replace("-----BEGIN PUBLIC KEY-----", "")
                    .replace("-----END PUBLIC KEY-----", "")
                    .replaceAll("\\s+", "");
            byte[] decoded = Base64.getDecoder().decode(cleaned);
            return KeyFactory.getInstance("RSA").generatePublic(new X509EncodedKeySpec(decoded));
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse SSM JWT public key", e);
        }
    }

    private PublicKey loadPublicKeyFromClasspath(String fileName) {
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(fileName)) {
            if (is == null) throw new RuntimeException("public_key.pem not found in classpath");
            String pem = new String(is.readAllBytes());
            return parsePublicKey(pem);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load public key from classpath", e);
        }
    }
    public Claims validateAndGetClaims(String token) {
            try {
                // use internal key
                System.out.println ("token received in the chat service token is it really same "+ token);
                if (token.startsWith("Bearer ")) token = token.substring(7);

                Jws<Claims> jwsClaims = Jwts.parserBuilder()
                    .setSigningKey(this.publicKey)
                    .build()
                    .parseClaimsJws(token);

                // Jws<Claims> jwsClaims = Jwts.parser().setSigningKey(this.publicKey).parseClaimsJws(token);
                System.out.println (" claims extracted in chat-service to see that  is really it has the same userId  " + jwsClaims);
                return jwsClaims.getBody();
            } catch (JwtException e) {
                throw new IllegalArgumentException("Invalid or expired token", e);
            }
        }
}