package com.queue.api_gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.SignatureException; // Added for specific signature error handling
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.List;

@Component
public class CustomAuthGatewayFilterFactory extends AbstractGatewayFilterFactory<CustomAuthGatewayFilterFactory.Config> {

    // --- FIX 1: Corrected typo from 'jwt.public.keyy' to 'jwt.public.key' ---
    @Value("${jwt.public.key}")
    private String publicKeyPem;

    private PublicKey publicKey;

    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/v1/auth/send-otp",
            "/api/v1/auth/verify-otp"
    );

    public CustomAuthGatewayFilterFactory() {
        super(Config.class);
        // --- DIAGNOSTIC LOG: Add this to confirm Spring is creating the bean ---
        System.out.println("CustomAuthGatewayFilterFactory constructor called! Spring is trying to create me.");
    }
    private boolean isPublicEndpoint(String path) {
        return OPEN_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (request.getMethod() == HttpMethod.OPTIONS) {
                return chain.filter(exchange);
            }

            String path = request.getPath().toString();
            if (isPublicEndpoint(path)) {
                return chain.filter(exchange);
            }
            System.out.println ("in filter"); // This log will only show if request proceeds to apply()

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            try {
                if (publicKey == null) {
                    publicKey = loadPublicKey(publicKeyPem);
                }

                // --- JJWT API Usage (already updated, but reiterating modern approach) ---
                // Prefer verifyWith() over setSigningKey() for PublicKey in JJWT 0.12.x+
                Claims claims = Jwts.parser()
                        .verifyWith(publicKey) // Recommended: use verifyWith for PublicKey
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();

                String phone = claims.getSubject();
                String userId = claims.get("userId", String.class);

                if (userId == null || phone == null) {
                    return onError(exchange, "Token missing userId or phone", HttpStatus.UNAUTHORIZED);
                }

                ServerHttpRequest modifiedRequest = request.mutate()
                        .header("X-User-Id", userId)
                        .header("X-User-Phone", phone)
                        .build();

                System.out.println("✅ X-User-Id: " + userId);
                System.out.println("✅ X-User-Phone: " + phone);

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (ExpiredJwtException e) {
                System.err.println("JWT Expired: " + e.getMessage());
                return onError(exchange, "Token expired", HttpStatus.UNAUTHORIZED);
            } catch (SignatureException e) { // Catch specific signature exception
                System.err.println("Invalid JWT Signature: " + e.getMessage());
                return onError(exchange, "Invalid token signature", HttpStatus.UNAUTHORIZED);
            } catch (JwtException e) {
                System.err.println("Invalid JWT: " + e.getMessage());
                return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
            } catch (Exception e) {
                System.err.println("Token validation failed due to an unexpected error: " + e.getClass().getName() + ": " + e.getMessage());
                return onError(exchange, "Token validation failed due to internal error", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        };
    }



    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
        String json = String.format("{\"error\": \"%s\"}", message);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(json.getBytes())));
    }

    private PublicKey loadPublicKey(String pem) throws Exception {
        String cleaned = pem.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");
        byte[] decoded = Base64.getDecoder().decode(cleaned);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }

    public static class Config {
        // Empty for now
    }
}
