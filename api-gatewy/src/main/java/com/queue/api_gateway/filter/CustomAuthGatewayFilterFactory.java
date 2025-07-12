//package com.queue.api_gateway.filter;
//
//import org.springframework.cloud.gateway.filter.GatewayFilter;
//import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.HttpMethod;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.server.reactive.ServerHttpRequest;
//import org.springframework.http.server.reactive.ServerHttpResponse;
//import org.springframework.stereotype.Component;
//
//import jakarta.annotation.PostConstruct;
//import java.io.InputStream;
//import java.security.KeyFactory;
//import java.security.PublicKey;
//import java.security.spec.X509EncodedKeySpec;
//import java.util.Base64;
//import java.util.List;
////
//@Component
//public class CustomAuthGatewayFilterFactory extends AbstractGatewayFilterFactory<CustomAuthGatewayFilterFactory.Config> {
////
////    private PublicKey publicKey;
////
////    private static final List<String> OPEN_ENDPOINTS = List.of(
////            "/api/v1/auth/send-otp",
////            "/api/v1/auth/verify-otp",
////            "/ws/info"
////    );
////
////    public CustomAuthGatewayFilterFactory() {
////        super(Config.class);
////        System.out.println("🛡️ CustomAuthGatewayFilterFactory constructor called!");
////    }
////
////    @PostConstruct
////    public void init() {
////        this.publicKey = loadPublicKeyFromClasspath("public_key.pem");
////    }
////
////    private boolean isPublicEndpoint(String path) {
////        System.out.println("🛂 Checking if public: " + path);
////        return OPEN_ENDPOINTS.stream().anyMatch(path::startsWith);
////    }
////
////    @Override
////    public GatewayFilter apply(Config config) {
////        return (exchange, chain) -> {
////            System.out.println("🌀 Filter triggered");
////
////            ServerHttpRequest request = exchange.getRequest();
////
////            if (request.getMethod() == HttpMethod.OPTIONS) {
////                return chain.filter(exchange);
////            }
////            request.getHeaders().forEach((key, value) ->
////                    System.out.println("📦 Header -> " + key + ": " + value)
////            );
//////            This will help you
//////            String path = request.getPath().toString();
////            String path = request.getURI().getPath(); // 🔁 replaces request.getPath().toString()
////            System.out.println ("--------------->>"+path);
////            if (isPublicEndpoint(path)) {
////                return chain.filter(exchange);
////            }
////
////            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
////            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
////                System.out.println("❌ Missing or invalid Authorization header");
////                return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
////            }
////
////            String token = authHeader.substring(7);
////            System.out.println ( "=========================================================================================================" );
////            System.out.println("🔑 Token received: " + token);
////
////            try {
////                Claims claims = Jwts.parser()
////                        .verifyWith(publicKey)
////                        .build()
////                        .parseSignedClaims(token)
////                        .getPayload();
////
////                System.out.println ( "<UNK> Claims received: " + claims);
////                System.out.println ("----------------------------------");
////                String userId = claims.get("userId", String.class);
////                String phone = claims.getSubject();
////
////                if (userId == null || phone == null) {
////                    return onError(exchange, "Token missing userId or phone", HttpStatus.UNAUTHORIZED);
////                }
////
////                ServerHttpRequest modifiedRequest = request.mutate()
////                        .header("X-User-Id", userId)
////                        .header("X-User-Phone", phone)
////                        .build();
////
////                System.out.println("✅ Authenticated UserId: " + userId + ", Phone: " + phone);
////                return chain.filter(exchange.mutate().request(modifiedRequest).build());
////
////            } catch (ExpiredJwtException e) {
////                System.err.println("❌ JWT Expired: " + e.getMessage());
////                return onError(exchange, "Token expired", HttpStatus.UNAUTHORIZED);
////            } catch (SignatureException e) {
////                System.err.println("❌ Invalid JWT Signature: " + e.getMessage());
////                return onError(exchange, "Invalid token signature", HttpStatus.UNAUTHORIZED);
////            } catch (JwtException e) {
////                System.err.println("❌ Invalid JWT: " + e.getMessage());
////                return onError(exchange, "Invalid token", HttpStatus.UNAUTHORIZED);
////            } catch (Exception e) {
////                System.err.println("❌ Error verifying token: " + e.getMessage());
////                return onError(exchange, "Internal error during token validation", HttpStatus.INTERNAL_SERVER_ERROR);
////            }
////        };
////    }
////
////    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
////        ServerHttpResponse response = exchange.getResponse();
////        response.setStatusCode(status);
////        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
////        String json = String.format("{\"error\": \"%s\"}", message);
////        return response.writeWith(Mono.just(response.bufferFactory().wrap(json.getBytes())));
////    }
////
////    private PublicKey loadPublicKeyFromClasspath(String filename) {
////        try (InputStream is = getClass().getClassLoader().getResourceAsStream(filename)) {
////            if (is == null) {
////                throw new IllegalArgumentException("public.pem not found in classpath");
////            }
////
////            String pem = new String(is.readAllBytes());
////            String cleaned = pem.replace("-----BEGIN PUBLIC KEY-----", "")
////                    .replace("-----END PUBLIC KEY-----", "")
////                    .replaceAll("\\s+", "");
////
////            byte[] decoded = Base64.getDecoder().decode(cleaned);
////            X509EncodedKeySpec spec = new X509EncodedKeySpec(decoded);
////            return KeyFactory.getInstance("RSA").generatePublic(spec);
////
////        } catch (Exception e) {
////            throw new RuntimeException("Failed to load public key from classpath", e);
////        }
////    }
////
////    public static class Config {
////        // Empty on purpose for future enhancements
////    }
//@Override
//public GatewayFilter apply(Config config) {
//    return (exchange, chain) -> {
//        System.out.println("🌀 Filter triggered");
//
//        ServerHttpRequest request = exchange.getRequest();
//        String path = request.getURI().getPath();
//
//        // Log all headers (optional, for debug)
//        request.getHeaders().forEach((key, value) ->
//                System.out.println("📦 Header -> " + key + ": " + value)
//        );
//
//        // Allow OPTIONS preflight
//        if (request.getMethod() == HttpMethod.OPTIONS) {
//            return chain.filter(exchange);
//        }
//
//        // Allow public endpoints without Authorization
//        if (isPublicEndpoint(path)) {
//            return chain.filter(exchange);
//        }
//
//        // Validate presence of Authorization header
//        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
//        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
//            System.out.println("❌ Missing or invalid Authorization header");
//            return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
//        }
//
//        // ✅ Forward request unchanged (token will be verified in downstream service)
//        return chain.filter(exchange);
//    };
//}
//
//
//}
//


/*
package com.queue.api_gateway.filter;

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

import java.util.List;

@Component
public class CustomAuthGatewayFilterFactory extends AbstractGatewayFilterFactory<CustomAuthGatewayFilterFactory.Config> {

    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/api/v1/auth/send-otp",
            "/api/v1/auth/verify-otp",
            "/ws/info",
            "/ws","/ws/",
            "/api/v1/users/getAllUsers"
            );

    public CustomAuthGatewayFilterFactory() {
        super(Config.class);
        System.out.println("🛡️ CustomAuthGatewayFilterFactory constructor called!");
    }

    private boolean isPublicEndpoint(String path) {
        return OPEN_ENDPOINTS.stream().anyMatch(path::startsWith);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            if (request.getMethod() == HttpMethod.OPTIONS || isPublicEndpoint(path)) {
                return chain.filter(exchange);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            return chain.filter(exchange); // ✅ Forward request unchanged
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String message, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add(HttpHeaders.CONTENT_TYPE, "application/json");
        String json = String.format("{\"error\": \"%s\"}", message);
        return response.writeWith(Mono.just(response.bufferFactory().wrap(json.getBytes())));
    }

    public static class Config {
        // Empty for now
    }
}
*/