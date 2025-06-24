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
import lombok.RequiredArgsConstructor;
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

    private final PrivateKey privateKey = loadPrivateKey();

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
            String privateKeyPem = """
                    -----BEGIN PRIVATE KEY-----
                    MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCOkO7iAjiqgYay
                    lJJ5rzKllXlVfnLi+ddnYp8Rz5at4qT7eEjNUbszUGZfq/Kqm8IVK5XnPOHw0ez5
                    SJ4vUsrwxWIHQjrYguy/o285/t/LWlHcG0OpuPb+eYSm7/q0CKVlcBfOPpOm+Adi
                    sbhDrfwgDgFXCL129bsLWNZjiUmTyx3fJrMQtUhVxUOOByn4WRWSzo9U9iC/CnSi
                    6aQOn4b4S8zyNZT820sgvxpFv48FaOX7busKd+cQlgiKeQkN/qEOv3OrJOdx5zw5
                    MqzaZfwIzQ5PS+yRkKwEXwguCt5pkNCBQ/bVDrUDYia6xQNAmIe3Gz54OXjipjoN
                    Wy9T/ApxAgMBAAECggEABnQP5X9OvoRy9bSiexYfujLthV3I3baMANl2vwkRIR65
                    iPWNVsKcm/Uc0TdYxSQcUWDXSK/u6qZXWQMSaqzPfr3HPcdfymBbeaLwXGUfDxba
                    o5aWBeyCEmEAoh2KURR0HNxJrj5oaMjg7V+DP7MJjuTmEXZrPHjhRjaiVmqcP++Y
                    Rnetare5XGc8CvBluT83a6PVFmb/lZ3ndox50SgLDini91PeXWYWAmrwaYXnE2AY
                    li0FEiI5p+jhZ+Sn8QsQd0lfHcqqdn53QBAqjS3arA3BcM7/31Rq03aSit27IXrF
                    EYQ8j5Hj1kSk1qYs/Oq8JafO3AwxFJwgv9cmiim0DQKBgQDC0bHUbszm5aIWADjJ
                    egu/BVPE3lDeLXoZIOKvMPY+qvZp1hk9xVR0wxUrXp8cB4At/wEEhjXDlMOuLE0r
                    ex440YIFCQ3dsIpdfGrZkFNCG3PJFus13PHLZTXZIQWzM9m0BmiILGNVZzafnsd7
                    vIN6fshmLZQossxVq/FZPoUG7QKBgQC7VmiEl9eeSUoYIXYZEnmbbZf0A/7trHA9
                    5giQhcv0XrZoMJzcHcAduVWquBGtVsNkc3alL4NcB+ryz/WzgJiUnzLEzkb3l0WF
                    TDz0AErQ8my8zCBdkEmEx1b6GZ3/KOxqYumxZUjph/MybdjBjFjnA+6rhGTawdRE
                    L0GTaJw9FQKBgCOZvi1bsgXfoKb0k2v96XeWuaAYIB75oH5HDCWHhPgetbjRbvti
                    u/Q6UfwC5oBwvnOpTb5N6DU9UiTZ46A2d2daoa/Z37bLM/2xZrUrMou6CIaOsZy+
                    K1FHxXdQGYKNzxKeuStpMR3CJrE0iq+J21zfHi/N1G07fyuIqCnuytBhAoGBALMD
                    efKiKl9OB2iRqQmCVwRIMHjzzIoPSl5Lz4lS4TdNvh5Hvcy0/R0qOgtdwz6Rdzso
                    /ooQogSyaDfIsy/pRWRX0CqyNqxnN/6NgH1lPhj2XyP2J0NhGm+wEJQDILBvyaJL
                    jKaAc7D8wU9CGmuxEk8Gue3aIInNyGmzgoU65HmVAoGBALkRCfaU+BlbXvwdR94b
                    YYZMTNGUdlyFJejH98Ig/qOfDpJE+jpGilB0eQ5QDewLx2aZ+MP82d+3OW7c0Pr5
                    kYSEjPkgjM/2f5q2Sm5mKXggiu6pDd3yZwC2XaWFJWlxUAqCvrYQdAKfKGvy/k7g
                    K/ImO3VfyPSXSqQq8e1VZdnS
                    -----END PRIVATE KEY-----
                    """;

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
