package com.queue.auth_service.service.impl;

import com.queue.auth_service.dto.*;
//import com.queue.auth_service.entity.Token;
//import com.queue.auth_service.entity.User;
import com.queue.auth_service.repository.AuthService;
import com.queue.auth_service.repository.TokenRepository;
import com.queue.auth_service.repository.UserRepository;
import com.queue.auth_service.repository.impl.OtpService;
//import com.queue.auth_service.service.AuthService;
//import com.queue.auth_service.service.OtpService;
//import com.queue.auth_service.util.JwtUtil;
import com.queue.auth_service.utill.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.time.LocalDateTime;

import org.springframework.security.core.userdetails.UsernameNotFoundException;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final OtpService otpService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;

    @Override
    public void sendOtp(String phone) {
        otpService.sendOtpToPhone(phone);
    }

    @Override
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        boolean valid = otpService.verifyOtp(request.getPhone(), request.getOtp());

        if (!valid) throw new RuntimeException("Invalid OTP");

        // fetch or create user
        User user = userRepository.findByPhone(request.getPhone())
                .orElseGet(() -> userRepository.save(new User(request.getPhone())));

        // generate JWT
        String accessToken = jwtUtil.generateAccessToken(user);
        String refreshToken = jwtUtil.generateRefreshToken();

        // store hashed refresh token
        tokenRepository.save(Token.builder()
                .refreshTokenHash(passwordEncoder.encode(refreshToken))
                .user(user)
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(30))
                .deviceInfo(request.getDeviceInfo())
                .isValid(true)
                .build());

        return new AuthResponse(accessToken, refreshToken);
    }

    @Override
    public AuthResponse refreshAccessToken(RefreshTokenRequest request) {
        Token token = tokenRepository.findByUserPhone(request.getPhone())
                .stream()
                .filter(t -> passwordEncoder.matches(request.getRefreshToken(), t.getRefreshTokenHash()) && t.isValid())
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        // generate new tokens
        String newAccess = jwtUtil.generateAccessToken(token.getUser());
        String newRefresh = jwtUtil.generateRefreshToken();

        // update token
        token.setRefreshTokenHash(passwordEncoder.encode(newRefresh));
        token.setIssuedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusDays(30));
        tokenRepository.save(token);

        return new AuthResponse(newAccess, newRefresh);
    }

    @Override
    public void logout(String bearerToken) {
        String accessToken = bearerToken.replace("Bearer ", "");
        String tokenId = jwtUtil.extractJti(accessToken);
        jwtUtil.blacklistToken(tokenId);
    }

    @Override
    public UserDto getCurrentUser(Principal principal) {
        return userRepository.findByPhone(principal.getName())
                .map(user -> new UserDto(user.getId(), user.getPhone()))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }

    @Override
    public TokenValidationResponse validateToken(String token) {
        boolean valid = jwtUtil.validateToken(token);
        String phone = jwtUtil.extractPhone(token);
        return new TokenValidationResponse(valid, phone);
    }
}
