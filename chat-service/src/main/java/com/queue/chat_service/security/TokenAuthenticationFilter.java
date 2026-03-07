//
//package com.queue.chat_service.security; // <--- CHANGED PACKAGE HERE
//
////import com.queue.chat_service.security.CustomUserDetails;
//import com.queue.chat_service.util.JwtUtil;
//import io.jsonwebtoken.Claims;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails; // Still needed for general UserDetails
//import org.springframework.stereotype.Component; // Still needed for @Component
//import org.springframework.web.filter.OncePerRequestFilter;
//import java.io.IOException;
//import java.util.Collections;
//import java.util.Collection;
//
//@Component
//public class TokenAuthenticationFilter extends OncePerRequestFilter {
//
//    @Autowired
//    private JwtUtil jwtUtil;
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
//            throws ServletException, IOException {
//        System.out.println ("filtering started on get Allusers");
//        String authHeader = request.getHeader("Authorization");
//
//        if (authHeader != null && authHeader.startsWith("Bearer ") && SecurityContextHolder.getContext().getAuthentication() == null) {
//            try {
//                Claims claims = jwtUtil.validateAndGetClaims(authHeader);
//
//                String userId = claims.get("userId", String.class);
//                String phone = claims.getSubject(); // usually email or phone
//                String username = claims.get("username", String.class);
//
//                if (userId != null) {
//                    Collection<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
//                    CustomUserDetails customUserDetails = new CustomUserDetails(userId, phone, authorities);
//
//                    UsernamePasswordAuthenticationToken auth =
//                            new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());
//
//                    SecurityContextHolder.getContext().setAuthentication(auth);
//                    System.out.println ("lets see that on everyhit does it set te auth or not ");
//                    System.out.println (auth);
//                    logger.info("✅ JWT Authenticated userId=" + userId);
//                }
//
//            } catch (Exception e) {
//                logger.error("❌ JWT validation failed: " + e.getMessage());
//            }
//        }
//
//        chain.doFilter(request, response);
//    }


//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
//            throws ServletException, IOException {
//
//        // Log all incoming headers for debugging, especially from API Gateway
//        System.out.println("--- Incoming HTTP Request Headers for TokenAuthenticationFilter ---");
//        request.getHeaderNames().asIterator()
//                .forEachRemaining(headerName -> System.out.println(headerName + ": " + request.getHeader(headerName)));
//        System.out.println("---------------------------------------------------------------");
//
//        String userId = request.getHeader("X-User-Id");
//        String phone = request.getHeader("X-User-Phone");
//        String username = request.getHeader("X-User-Username"); // Optional, if distinct from userId
//
//        System.out.println ("TokenAuthenticationFilter: Received userId: "+userId+", phone: "+phone+", username: "+username);
//
//        // Authenticate only if userId is present and no existing authentication
//        if (userId != null && !userId.trim().isEmpty() && SecurityContextHolder.getContext().getAuthentication() == null) {
//
//            Collection<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
//
//            // Create an instance of our CustomUserDetails
//            CustomUserDetails customUserDetails = new CustomUserDetails(userId, phone, authorities);
//
//            UsernamePasswordAuthenticationToken authentication =
//                    new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());
//            SecurityContextHolder.getContext().setAuthentication(authentication);
//            logger.info("✅ Authenticated user with ID (from Gateway) and set CustomUserDetails principal: " + userId);
//            System.out.println("TokenAuthenticationFilter: Principal type set: " +
//                    SecurityContextHolder.getContext().getAuthentication().getPrincipal().getClass().getName());
//
//        } else if (userId == null || userId.trim().isEmpty()) {
//            System.out.println("TokenAuthenticationFilter: X-User-Id header not found or empty for URI: " + request.getRequestURI() + ". Request will proceed as unauthenticated.");
//        } else {
//            System.out.println("TokenAuthenticationFilter: Authentication already present for user: " +
//                    SecurityContextHolder.getContext().getAuthentication().getName() + " for URI: " + request.getRequestURI());
//        }
//
//        chain.doFilter(request, response);
//    }
//}



package com.queue.chat_service.security;

import com.queue.chat_service.util.JwtUtil;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class TokenAuthenticationFilter extends OncePerRequestFilter {

    @Autowired private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                Claims claims = jwtUtil.validateAndGetClaims(token);

                String userId = claims.get("userId", String.class);
                String phone = claims.getSubject();

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    CustomUserDetails userDetails =
                            new CustomUserDetails(
                                    userId,
                                    phone,
                                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                            );

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } catch (Exception ignored) {
                // optional: clear context or set 401; usually just continue and let entrypoint handle it
            }
        }

        chain.doFilter(request, response);
    }
}


///*
//*
//*
//
// package com.queue.chat_service.config;
//
//import com.queue.chat_service.security.CustomUserDetails; // Import your CustomUserDetails
//import org.springframework.context.annotation.Configuration;
//import org.springframework.messaging.Message;
//import org.springframework.messaging.MessageChannel;
//import org.springframework.messaging.simp.config.ChannelRegistration;
//import org.springframework.messaging.simp.config.MessageBrokerRegistry;
//import org.springframework.messaging.simp.stomp.StompCommand;
//import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
//import org.springframework.messaging.support.ChannelInterceptor;
//import org.springframework.messaging.support.MessageHeaderAccessor;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
//import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
//import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
//
//import java.util.Collections;
//import java.util.Map;
//
//@Configuration
//@EnableWebSocketMessageBroker
//public class WebSocketSecurityConfig implements WebSocketMessageBrokerConfigurer {
//
//    @Override
//    public void configureMessageBroker(MessageBrokerRegistry config) {
//        config.enableSimpleBroker("/topic", "/queue");
//        config.setApplicationDestinationPrefixes("/app");
//        config.setUserDestinationPrefix("/user");
//    }
//
//    @Override
//    public void registerStompEndpoints(StompEndpointRegistry registry) {
//        registry.addEndpoint("/ws")
//                .setAllowedOriginPatterns("*") // IMPORTANT: Restrict this in production
//                .withSockJS();
//    }
//
//    @Override
//    public void configureClientInboundChannel(ChannelRegistration registration) {
//        registration.interceptors(new ChannelInterceptor() {
//            @Override
//            public Message<?> preSend(Message<?> message, MessageChannel channel) {
//                StompHeaderAccessor accessor =
//                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
//
//                System.out.println("--- WebSocket ChannelInterceptor: preSend invoked for command: " + accessor.getCommand() + " ---");
//                System.out.println("WebSocket ChannelInterceptor: Message Headers: " + message.getHeaders());
//                System.out.println("WebSocket ChannelInterceptor: STOMP Native Headers: " + accessor.getNativeHeaders());
//
//                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
//                    String userId = accessor.getFirstNativeHeader("X-User-Id");
//                    String phone = accessor.getFirstNativeHeader("X-User-Phone");
//                    String username = accessor.getFirstNativeHeader("X-User-Username");
//
//                    System.out.println("WebSocket ChannelInterceptor (CONNECT): Extracted userId: "+userId+", phone: "+phone+", username: "+username);
//
//                    if (userId != null && !userId.trim().isEmpty()) {
//                        try {
//                            // Check if an Authentication is already present in SecurityContextHolder
//                            // This might be the case if TokenAuthenticationFilter (HTTP filter) already ran.
//                            Authentication existingAuth = SecurityContextHolder.getContext().getAuthentication();
//                            if (existingAuth != null && existingAuth.isAuthenticated() && !(existingAuth.getPrincipal() instanceof String && "anonymousUser".equals(existingAuth.getPrincipal()))) {
//                                System.out.println("WebSocket ChannelInterceptor (CONNECT): Existing authentication found: " + existingAuth.getName() + ", principal type: " + existingAuth.getPrincipal().getClass().getName());
//                                accessor.setUser(existingAuth); // Ensure the STOMP accessor is set
//                            } else {
//                                System.out.println("WebSocket ChannelInterceptor (CONNECT): No valid existing authentication, proceeding with new auth from headers.");
//                                Collection<SimpleGrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
//                                CustomUserDetails customUserDetails = new CustomUserDetails(userId, phone, authorities);
//
//                                UsernamePasswordAuthenticationToken authentication =
//                                        new UsernamePasswordAuthenticationToken(customUserDetails, null, customUserDetails.getAuthorities());
//
//                                accessor.setUser(authentication); // VITAL for STOMP security
//                                SecurityContextHolder.getContext().setAuthentication(authentication); // Also set for general Spring Security context
//
//                                System.out.println("WebSocket ChannelInterceptor (CONNECT): Authentication successful for user: " + userId);
//                                System.out.println("WebSocket ChannelInterceptor (CONNECT): Principal type set in accessor/context: " +
//                                                   authentication.getPrincipal().getClass().getName());
//                            }
//                        } catch (Exception e) {
//                            System.err.println("ERROR in WebSocket ChannelInterceptor (CONNECT) authentication: " + e.getMessage());
//                            e.printStackTrace();
//                            // Deny connection if authentication fails
//                            accessor.setSessionId("unauthenticated");
//                            accessor.setHeader(StompHeaderAccessor.STOMP_ERROR_HEADER, "Authentication failed during WebSocket CONNECT: " + e.getMessage());
//                            return null; // Prevent message from proceeding
//                        }
//                    } else {
//                        System.err.println("WARNING: WebSocket ChannelInterceptor (CONNECT): X-User-Id header missing. Denying connection.");
//                        accessor.setSessionId("unauthenticated");
//                        accessor.setHeader(StompHeaderAccessor.STOMP_ERROR_HEADER, "Authentication required (missing X-User-Id header) for WebSocket.");
//                        return null; // Prevent message from proceeding
//                    }
//                } else if (accessor.getCommand() == null || accessor.getCommand() == StompCommand.UNKNOWN) {
//                    System.out.println("WebSocket ChannelInterceptor: Received unknown/null STOMP command. Passing through.");
//                }
//
//                return message; // Continue the message flow
//            }
//        });
//    }
//}
//
//*
//*
//* */









