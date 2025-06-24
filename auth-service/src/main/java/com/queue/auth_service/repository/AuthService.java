package com.queue.auth_service.repository;

import com.queue.auth_service.dto.AuthResponse;
import com.queue.auth_service.dto.OtpVerifyRequest;
import com.queue.auth_service.dto.TokenValidationResponse;
import com.queue.auth_service.dto.UserDto;

import java.security.Principal;

public interface AuthService {

    void sendOtp(String phone);

    AuthResponse verifyOtp(OtpVerifyRequest request);

//    AuthResponse refresh??AccessToken(RefreshTokenRequest request);

//    void logout(String bearerToken);

//    UserDto getCurrentUser(Principal principal);

//    TokenValidationResponse validateToken(String token);
}
