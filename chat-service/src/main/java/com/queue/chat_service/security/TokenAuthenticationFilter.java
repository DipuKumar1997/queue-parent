//package com.queue.chat_service.security;
//
////import com.chat.app.service.AuthServiceProxy;
//import com.queue.chat_service.service.AuthServiceProxy;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
//import org.springframework.stereotype.Component;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//
//@Component
//public class TokenAuthenticationFilter extends OncePerRequestFilter {
//
//    @Autowired
//    private AuthServiceProxy authServiceProxy;
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
//            throws ServletException, IOException {
//
//        final String authorizationHeader = request.getHeader("Authorization");
//
//        String jwt = null;
//        AuthServiceProxy.TokenValidationResponse validationResponse = null;
//
//        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
//            jwt = authorizationHeader.substring(7); // Extract token part
//            System.out.println ("jwt in token authenticationfilter adn lets see it is running or not  " + jwt);
//            validationResponse = authServiceProxy.validateToken(jwt);
//            System.out.println (validationResponse.toString());
//        }
//
//
//        if (validationResponse != null && validationResponse.isValid() && SecurityContextHolder.getContext().getAuthentication() == null) {
//            String userId = validationResponse.getUserId(); // This is the UUID from Auth Service
//
//            UsernamePasswordAuthenticationToken authentication =
//                    new UsernamePasswordAuthenticationToken(userId, null, null);
//            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//            SecurityContextHolder.getContext().setAuthentication(authentication);
//            logger.info("Authenticated user with ID (from Auth Service): " + userId);
//        } else if (validationResponse == null && authorizationHeader != null) {
//            // Token was present but invalid/expired according to Auth Service
//            // Spring Security's default access denied handler will manage 401/403 responses
//            logger.warn("Authentication failed: Invalid or expired token received for request to " + request.getRequestURI());
//        }
//        chain.doFilter(request, response);
//    }
//}


package com.queue.chat_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class TokenAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String userId = request.getHeader("X-User-Id");
        System.out.println ("userId getting from the headers "+userId);
        String phone = request.getHeader("X-User-Phone");
        String username = request.getHeader("X-User-Username");

        if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, null);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            logger.info("✅ Authenticated user with ID (from Gateway): " + userId);
        }

        chain.doFilter(request, response);
    }
}
