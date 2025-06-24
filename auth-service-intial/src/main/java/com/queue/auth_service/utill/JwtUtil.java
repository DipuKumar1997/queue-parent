package com.queue.auth_service.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private final Key secretKey = Keys.hmacShaKeyFor("your_very_secure_secret_key_which_should_be_256_bits_long".getBytes());
    private final long accessTokenValidity = 15 * 60 * 1000; // 15 min
    private final long refreshTokenValidity = 30L * 24 * 60 * 60 * 1000; // 30 days

    public String generateAccessToken(String phone) {
        Claims claims = Jwts.claims().setSubject(phone);
        claims.setId(UUID.randomUUID().toString());

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenValidity))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken() {
        Claims claims = Jwts.claims().setSubject("refresh");
        claims.setId(UUID.randomUUID().toString());

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenValidity))
                .signWith(secretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractPhone(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractJti(String token) {
        return extractAllClaims(token).getId();
    }

    public boolean validateToken(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(secretKey)
                .build() // ✅ You must build() the parser first
                .parseClaimsJws(token)
                .getBody();
    }
}
