package com.queue.auth_service.repository;
public interface AuthService {

    void sendOtp(String phone);

    AuthResponse verifyOtp(OtpVerifyRequest request);

    AuthResponse refreshAccessToken(RefreshTokenRequest request);

    void logout(String bearerToken);

    UserDto getCurrentUser(Principal principal);

    TokenValidationResponse validateToken(String token);
}
