//package com.queue.auth_service.utill;
//
//import com.queue.auth_service.Entity.User;
//import com.queue.auth_service.repository.UserRepository;
//import io.jsonwebtoken.*;
//import io.jsonwebtoken.security.Keys;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Component;
//
//import java.security.Key;
//import java.util.Date;
//import java.util.Optional;
//import java.util.UUID;
//
//@Component
//@RequiredArgsConstructor
//public class JwtUtil {
//
//    private final UserRepository userRepository;
//
//    private final Key secretKey = Keys.hmacShaKeyFor(
//            "your_very_secure_secret_key_which_should_be_256_bits_long".getBytes()
//    );
//    private final long accessTokenValidity = 15 * 60 * 1000; // 15 min
//    private final long refreshTokenValidity = 30L * 24 * 60 * 60 * 1000; // 30 days
//
//    public String generateAccessToken(String phone) {
//        Optional<User> userOpt = userRepository.findByPhone(phone);
//        if (userOpt.isEmpty()) {
//            throw new IllegalArgumentException("No user found with phone: " + phone);
//        }
//        User user = userOpt.get();
//
//        Claims claims = Jwts.claims().setSubject(phone);
//        claims.put("userId", user.getId());
//        claims.setId(UUID.randomUUID().toString());
//
//        return Jwts.builder()
//                .setClaims(claims)
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + accessTokenValidity))
//                .signWith(secretKey, SignatureAlgorithm.HS256)
//                .compact();
//    }
//
//    public String generateRefreshToken() {
//        Claims claims = Jwts.claims().setSubject("refresh");
//        claims.setId(UUID.randomUUID().toString());
//
//        return Jwts.builder()
//                .setClaims(claims)
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenValidity))
//                .signWith(secretKey, SignatureAlgorithm.HS256)
//                .compact();
//    }
//
//    public String extractPhone(String token) {
//        return extractAllClaimsSafe(token).getSubject();
//    }
//
//    public String extractUserId(String token) {
//        Claims claims = extractAllClaimsSafe(token);
//        Object userIdObj = claims.get("userId");
//        if (userIdObj == null) {
//            throw new IllegalArgumentException("Token does not contain userId claim");
//        }
//        return userIdObj.toString();
//    }
//
//    public boolean validateToken(String token) {
//        try {
//            extractAllClaimsSafe(token);
//            return true;
//        } catch (JwtException | IllegalArgumentException e) {
//            return false;
//        }
//    }
//
//    private Claims extractAllClaimsSafe(String token) {
//        try {
//            return Jwts.parserBuilder()
//                    .setSigningKey(secretKey)
//                    .build()
//                    .parseClaimsJws(token)
//                    .getBody();
//        } catch (ExpiredJwtException e) {
//            throw new IllegalArgumentException("Token is expired", e);
//        } catch (UnsupportedJwtException | MalformedJwtException | SecurityException e) {
//            throw new IllegalArgumentException("Invalid JWT token", e);
//        } catch (JwtException e) {
//            throw new IllegalArgumentException("JWT processing failed", e);
//        }
//    }
//}



package com.queue.auth_service.utill;

import com.queue.auth_service.Entity.User;
import com.queue.auth_service.repository.UserRepository;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtUtil {

//    private final PrivateKey privateKey = loadPrivateKey();
        private PrivateKey privateKey;

            @PostConstruct
            private void init() {
                this.privateKey = loadPrivateKey();
            }

    private final long accessTokenValidity = 15 * 60 * 1000; // 15 min
    private final long refreshTokenValidity = 30L * 24 * 60 * 60 * 1000; // 30 days

    private UserRepository userRepository;

    public String generateAccessToken(User user) {
//       Optional<User> user =  userRepository.findByPhone(phone);
//       if (user.isPresent()) {
//           String userId = String.valueOf ( user.get ().getId () );
//       }

        // .setSubject (  )
        return Jwts.builder()
                .claim("userId", user.getId ().toString())
                .setSubject(user.getPhone())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenValidity))
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
    }

    public String generateRefreshToken() {
        return Jwts.builder()
                .setSubject("refresh")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenValidity))
                .signWith(privateKey, SignatureAlgorithm.RS256)
                .compact();
    }

    private PrivateKey loadPrivateKey() {
        try {
            ClassPathResource resource = new ClassPathResource ("private_key.pem");
            String privateKeyPem = new String(resource.getInputStream().readAllBytes());


            privateKeyPem = privateKeyPem
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .replaceAll("\\s+", "");

            byte[] keyBytes = Base64.getDecoder().decode(privateKeyPem);
            PKCS8EncodedKeySpec spec = new PKCS8EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            return kf.generatePrivate(spec);
        } catch (Exception e) {
            throw new RuntimeException("Failed to load private key", e);
        }
    }
}
