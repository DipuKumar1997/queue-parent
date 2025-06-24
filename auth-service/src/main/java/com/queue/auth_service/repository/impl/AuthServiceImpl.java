package com.queue.auth_service.repository.impl;
import com.queue.auth_service.Entity.Token;
import com.queue.auth_service.Entity.User;
import com.queue.auth_service.dto.*;
import com.queue.auth_service.repository.AuthService;
import com.queue.auth_service.repository.TokenRepository;
import com.queue.auth_service.repository.UserRepository;
import com.queue.auth_service.utill.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final OtpServiceImpl otpService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void sendOtp(String phone) {
        otpService.sendOtpToPhone(phone);
    }

    @Override
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        System.out.println(request.getPhone());
        System.out.println(request.getOtp());
        boolean valid = otpService.verifyOtp(request.getPhone(), request.getOtp());
        if (!valid) throw new RuntimeException("Invalid OTP");

        User user = userRepository.findByPhone(request.getPhone())
                .orElseGet(() -> userRepository.save(new User(request.getPhone())));
        System.out.println ("-------------------------------------------------------------------------------------------");
        System.out.println ("user.getId() --->> " + user.getId());
        System.out.println ("user.getPhone() --->> " + user.getPhone());
        System.out.println (user.toString ());
        System.out.println (user);
        System.out.println ("-------------------------------------------------------------------------------------------");
//        String accessToken = jwtUtil.generateAccessToken(user.getPhone());
        String accessToken = jwtUtil.generateAccessToken(user);

        String refreshToken = jwtUtil.generateRefreshToken();

        System.out.println("accessToken in AuthServiceImpl: " + accessToken);
        System.out.println("refreshToken in AuthServiceImpl: " + refreshToken);


       Token t =  tokenRepository.save(Token.builder()
                .refreshToken(passwordEncoder.encode(refreshToken))
                .user(user)
                .issuedAt(LocalDateTime.now())
                .expiresAt(LocalDateTime.now().plusDays(30))
//          .deviceInfo(request.getDeviceInfo())
                .isValid(true)
                .build());
        System.out.println("t from the AuthServiceImpl " + t.toString());
//        return new AuthResponse(accessToken, refreshToken);
        return new AuthResponse(accessToken, refreshToken, new UserDto(user.getId(), user.getPhone()));
    }
}

/*
*
*
*
*
*
*
*
*
*
*
//    @Override
//    public AuthResponse refreshAccessToken(RefreshTokenRequest request) {
//        Token token = tokenRepository.findByUserPhone((request.getPhone())
//                .stream()
//                .filter(t -> passwordEncoder.matches(request.getRefreshToken(), t.getRefreshTokenHash()) && t.isValid())
//                .findFirst()
//                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
//
//        String newAccess = jwtUtil.generateAccessToken(token.getUser().getPhone());
//        String newRefresh = jwtUtil.generateRefreshToken();
//
//        token.setRefreshTokenHash(passwordEncoder.encode(newRefresh));
//        token.setIssuedAt(LocalDateTime.now());
//        token.setExpiresAt(LocalDateTime.now().plusDays(30));
//        tokenRepository.save(token);
//
//        return new AuthResponse(newAccess, newRefresh);
//    }

//    @Override
//    public void logout(String bearerToken) {
//        String accessToken = bearerToken.replace("Bearer ", "");
//        String tokenId = jwtUtil.extractJti(accessToken);
//        jwtUtil.blacklistToken(tokenId); // You must implement this method or remove it
//    }

//    @Override
//    public UserDto getCurrentUser(Principal principal) {
//        return userRepository.findByPhone(principal.getName())
//                .map(user -> new UserDto((user.getId()), user.getPhone()))
//                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
//    }

//    @Override
//    public TokenValidationResponse validateToken(String token) {
//        boolean valid = jwtUtil.validateToken(token);
//        System.out.println("jwtUtil.validateToken(token)  -->> "+ valid);
////        String phone = jwtUtil.extractPhone(token);
//
//        String userId = jwtUtil.extractUserId( token );
//
//        System.out.println ("userID in AuthService impl is : -- "+userId);
////        System.out.println("jwtUtil.extractPhone(token)  -->> "+ phone);
//        return new TokenValidationResponse(valid, userId );
//    }
*
* */
