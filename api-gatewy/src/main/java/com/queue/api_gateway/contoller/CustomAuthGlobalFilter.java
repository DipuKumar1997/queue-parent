//package com.queue.api_gateway.controller; // Replace with your actual Gateway package
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.security.SignatureException;
//import jakarta.annotation.PostConstruct;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.cloud.gateway.filter.GatewayFilterChain;
//import org.springframework.cloud.gateway.filter.GlobalFilter;
//import org.springframework.core.Ordered;
//import org.springframework.core.io.ClassPathResource;
//import org.springframework.http.HttpHeaders; // Import HttpHeaders
//import org.springframework.http.HttpStatus;
//import org.springframework.http.server.reactive.ServerHttpRequest;
//import org.springframework.stereotype.Component;
//import org.springframework.web.server.ServerWebExchange;
//import reactor.core.publisher.Mono;
//
//import java.security.KeyFactory;
//import java.security.PublicKey;
//import java.security.spec.X509EncodedKeySpec;
//import java.util.Base64;
//import java.util.List;
//import java.util.function.Consumer; // Import Consumer
//
//@Component
//public class CustomAuthGlobalFilter implements GlobalFilter, Ordered {
//
//        private String publicKeyPem;
//        @PostConstruct
//        public void init() throws Exception {
//            ClassPathResource resource = new ClassPathResource("public_key.pem");
//            publicKeyPem = new String(resource.getInputStream().readAllBytes());
//        }
//
//    private PublicKey publicKey;
//
//    private PublicKey getPublicKey() {
//        if (publicKey == null) {
//            try {
//                String publicKeyCleaned = publicKeyPem
//                        .replace("-----BEGIN PUBLIC KEY-----", "")
//                        .replace("-----END PUBLIC KEY-----", "")
//                        .replaceAll("\\s+", "");
//                byte[] keyBytes = Base64.getDecoder().decode(publicKeyCleaned);
//                X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
//                KeyFactory kf = KeyFactory.getInstance("RSA");
//                publicKey = kf.generatePublic(spec);
//            } catch (Exception e) {
//                throw new RuntimeException("Failed to load public key for JWT validation", e);
//            }
//        }
//        return publicKey;
//    }
//
//    @Override
//    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
//        System.out.println("✅ Gateway: CustomAuthGlobalFilter triggered");
//        String path = exchange.getRequest().getURI().getPath();
//
//        List<String> exemptedPaths = List.of(
//                "/api/v1/auth/send-otp",
//                "/api/v1/auth/verify-otp",
//                "/favicon.ico",
//                "/ws/"
//        );
//
//        if (exemptedPaths.stream().anyMatch(path::startsWith)) {
//            System.out.println("Gateway: Exempted path: " + path + " from authentication.");
//            return chain.filter(exchange);
//        }
//
//        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION); // Use HttpHeaders
//        System.out.println("Gateway: Processing request for path: " + path + ", Authorization: " + authHeader);
//
//        if (authHeader != null && authHeader.startsWith("Bearer ")) {
//            String token = authHeader.substring(7);
//            try {
//                Claims claims = Jwts.parser()
//                        .verifyWith(getPublicKey()) // Recommended: use verifyWith for PublicKey
//                        .build()
//                        .parseSignedClaims(token)
//                        .getPayload();
//
//                String userId = claims.get("userId", String.class);
//                String phone = claims.get("phone", String.class);
//                String username = claims.getSubject(); // Or claims.get("username", String.class)
//
//                if (userId == null || userId.isEmpty()) {
//                    System.err.println("Gateway: JWT valid but 'userId' claim is missing for path: " + path);
//                    exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//                    return exchange.getResponse().setComplete();
//                }
//                Consumer<HttpHeaders> httpHeaders = httpHeaders1 -> {
//                    httpHeaders1.set("X-User-Id", userId);
//                    if (phone != null) httpHeaders1.set("X-User-Phone", phone);
//                    if (username != null) httpHeaders1.set("X-User-Username", username);
//                };
//                System.out.println ("====start=====");
//                System.out.println ("httpHeaders: " + httpHeaders);
//                System.out.println (httpHeaders.toString ());
//                System.out.println ("=====end=====");
//                Consumer<HttpHeaders> allHeadersConsumer = headers -> {
//                    httpHeaders.accept(headers); // Apply our custom headers
//                    headers.set(HttpHeaders.AUTHORIZATION, authHeader); // Ensure Authorization header is present
//                };
//                ServerHttpRequest request = exchange.getRequest().mutate()
//                        .headers(allHeadersConsumer) // Apply all headers
//                        .build();
//
//                System.out.println("Gateway: Authenticated user: " + userId + " for path: " + path + ". Added X-User-Id, X-User-Phone, X-User-Username headers.");
//                System.out.println("Gateway: Forwarding headers including Authorization and X-User-* for path: " + path);
//
//                return chain.filter(exchange.mutate().request(request).build());
//
//            } catch (  IllegalArgumentException | io.jsonwebtoken.JwtException e) {
//                System.err.println("Gateway: JWT validation failed for path: " + path + " - " + e.getMessage());
//                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//                return exchange.getResponse().setComplete();
//            }
//        }
//
//        System.err.println("Gateway: No Authorization header for authenticated path: " + path);
//        exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
//        return exchange.getResponse().setComplete();
//    }
//
//    @Override
//    public int getOrder() {
//        return -1; // Execute this filter very early
//    }
//}
