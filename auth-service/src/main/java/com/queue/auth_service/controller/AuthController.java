package com.queue.auth_service.controller;

import com.queue.auth_service.dto.AuthResponse;
import com.queue.auth_service.dto.OtpRequestDto;
import com.queue.auth_service.dto.OtpVerifyRequest;
import com.queue.auth_service.dto.TokenValidationResponse;
import com.queue.auth_service.repository.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RestController
//@CrossOrigin("*")
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

//    @PostMapping("/send-otp")
//    public ResponseEntity<?> sendOtp(@RequestBody OtpRequestDto request) {
//        System.out.println (request);
//        if (request.getPhone() == null || request.getPhone().isBlank()) {
//            return ResponseEntity.badRequest().body("Phone number is required.");
//        }
//        try{
//            authService.sendOtp(request.getPhone());
//        }catch (RuntimeException e){
//            System.out.println ("e.getMessage() " +e.getMessage());
//            return ResponseEntity.badRequest().body(e.getMessage());
//        }
//
//        return ResponseEntity.ok("OTP sent");
//    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody OtpRequestDto request) {
        if (request.getPhone() == null || request.getPhone().isBlank()) {
            return ResponseEntity.badRequest().body( Collections.singletonMap("message", "Phone number is required."));
        }
        try{
            authService.sendOtp(request.getPhone());
            // Return a JSON object for success
            return ResponseEntity.ok(Collections.singletonMap("message", "OTP sent successfully!"));
        }catch (RuntimeException e){
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", e.getMessage()));
        }
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody OtpVerifyRequest request) {
        System.out.println ( Optional.ofNullable(request.getPhone()).orElse(""));
        System.out.println ( Optional.ofNullable(request.getOtp()).orElse(""));

        AuthResponse a =  authService.verifyOtp(request);
        System.out.println (a.toString ());
           return ResponseEntity.ok(a);
    }
//    @PostMapping("/refresh-token")
//    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
//        return ResponseEntity.ok(authService.refreshAccessToken(request));
//    }
//    @PostMapping("/validate-token")
//    public ResponseEntity<TokenValidationResponse> validateToken(@RequestHeader("Authorization") String token) {
//        System.out.println ("token coming in auth-service " + token);
//        return ResponseEntity.ok(authService.validateToken(token));
//    }
}
