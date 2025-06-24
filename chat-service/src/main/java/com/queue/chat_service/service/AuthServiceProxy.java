//package com.queue.chat_service.service;
//
//import com.queue.chat_service.model.User;
//import com.queue.chat_service.repository.UserRepository;
//import lombok.Data;
//import lombok.NoArgsConstructor;
//import lombok.RequiredArgsConstructor;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.HttpClientErrorException;
//import org.springframework.web.client.RestTemplate;
//
//import java.util.Collections;
//import java.util.Optional;
//
//@Service
//@RequiredArgsConstructor // Lombok will generate a constructor with final fields
//public class AuthServiceProxy {
////
////    public AuthServiceProxy(UserRepository userRepository, String authServiceBaseUrl, RestTemplate restTemplate) {
////        this.userRepository = userRepository;
////        this.authServiceBaseUrl = authServiceBaseUrl;
////        this.restTemplate = restTemplate;
////    }
//
//    private final Logger logger = LoggerFactory.getLogger(AuthServiceProxy.class);
//    private final  UserRepository userRepository; // Made final for @RequiredArgsConstructor injection
//
//    @Value("${auth.service.url}")
//    private String authServiceBaseUrl;
//
//    // RestTemplate should be injected if you have a custom bean,
//    // or you can initialize it directly if no specific configuration is needed.
//    // For simplicity, let's keep it directly initialized if not injected externally.
//    // However, it's generally better to inject it if you're using Spring Boot.
//    private final  RestTemplate restTemplate;
//
//    // Constructor for RestTemplate if not injected as a bean
//    // If you have a RestTemplate bean configured elsewhere, you can remove this
//    // and just have `private final RestTemplate restTemplate;` and it will be injected.
////    public AuthServiceProxy(UserRepository userRepository, RestTemplate restTemplate) {
////        this.userRepository = userRepository;
////        this.restTemplate = restTemplate;
////    }
//
//    // DTO to receive response from Auth Service
//    @Data
//    @NoArgsConstructor
//    public static class TokenValidationResponse {
//        private boolean isValid;
//        private String userId;
//        private String phone;
//        private String username;
//        private String message; // Added to carry messages from Auth Service or custom messages
//    }
//
//    // Custom Exception for specific error handling
//    public static class InvalidTokenException extends RuntimeException {
//        public InvalidTokenException(String message) {
//            super(message);
//        }
//    }
//
//    /**
//     * Validates a JWT token by calling the Auth Service.
//     * @param token The JWT token string (without "Bearer " prefix, unless Auth Service expects it).
//     * @return TokenValidationResponse with user details if valid.
//     * @throws InvalidTokenException if the token is invalid or an error occurs during validation.
//     */
//    public TokenValidationResponse validateToken(String token) throws InvalidTokenException {
//        String validationUrl = authServiceBaseUrl + "/validate-token";
//
//        HttpHeaders headers = new HttpHeaders();
//        // IMPORTANT: If your Auth Service expects "Bearer <token>", add "Bearer " prefix here.
//        // For example: headers.set("Authorization", "Bearer " + token);
//        // Based on your @RequestHeader("Authorization") String token, it probably expects just the token string.
//        headers.set("Authorization", token);
//        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
//
//        HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
//
//        try {
//            ResponseEntity<TokenValidationResponse> response = restTemplate.exchange(
//                    validationUrl,
//                    HttpMethod.POST, // Ensure this matches your Auth Service's @PostMapping
//                    requestEntity,
//                    TokenValidationResponse.class
//            );
//
//            TokenValidationResponse responseBody = response.getBody();
//            logger.info("Auth Service Response Body: {}", responseBody); // Debug print
//
//            if (response.getStatusCode().is2xxSuccessful() && responseBody != null && responseBody.isValid()) {
//                // Save or update user if token is valid
//                Optional<User> userOptional = userRepository.findByPhone(responseBody.getPhone());
//                if (userOptional.isEmpty()) {
//                    User newUser = new User();
//                    newUser.setPhone(responseBody.getPhone());
//                    newUser.setUsername(responseBody.getUsername());
//                    newUser.setId(responseBody.getUserId());
//                    userRepository.save(newUser);
//                    logger.info("New user saved: {}", newUser.getUsername());
//                } else {
//                    logger.info("User already exists: {}", userOptional.get().getUsername());
//                    // Optionally, update existing user details if needed
//                }
//                responseBody.setMessage("Token validated successfully.");
//                return responseBody;
//            } else {
//                // If Auth Service returns non-2xx status or isValid is false
//                String errorMessage = "Token validation failed: " +
//                        (responseBody != null && responseBody.getMessage() != null ? responseBody.getMessage() : "Auth Service returned an invalid response or token is not valid.");
//                logger.warn("Auth Service returned non-successful response or invalid token: {} - {}", response.getStatusCode(), errorMessage);
//                throw new InvalidTokenException(errorMessage);
//            }
//        } catch (HttpClientErrorException.Unauthorized e) {
//            logger.error("Token rejected by Auth Service (401 Unauthorized): {}", e.getMessage());
//            throw new InvalidTokenException("Invalid token. Please log in again. " + e.getMessage());
//        } catch (HttpClientErrorException.Forbidden e) {
//            logger.error("Access forbidden by Auth Service (403 Forbidden): {}", e.getMessage());
//            throw new InvalidTokenException("Access denied. Your token does not have the necessary permissions. " + e.getMessage());
//        } catch (Exception e) {
//            logger.error("Error calling Auth Service: {}", e.getMessage(), e); // Log full stack trace
//            throw new InvalidTokenException("An unexpected error occurred during token validation. Please try again later. " + e.getMessage());
//        }
//    }
//}