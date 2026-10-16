//package com.queue.auth_service.security;//package com.queue.auth_service.security;
//
//import com.queue.auth_service.utill.JwtUtil;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import jdk.jfr.Category;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
//import org.springframework.stereotype.Component;
//import org.springframework.web._filter.OncePerRequestFilter;
//
//import java.io.IOException;
//@Component
//public class JwtAuthenticationFilter extends OncePerRequestFilter {
//
//    private final JwtUtil jwtUtil;
//    private final UserDetailsService userDetailsService;
//
//    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
//        this.jwtUtil = jwtUtil;
//        this.userDetailsService = userDetailsService;
//    }
//
//    @Override
//    protected void doFilterInternal(HttpServletRequest request,
//                                    HttpServletResponse response,
//                                    FilterChain filterChain)
//            throws ServletException, IOException {
//        String authHeader = request.getHeader("Authorization");
//        if (authHeader != null && authHeader.startsWith("Bearer ")) {
//            String jwt = authHeader.substring(7);
////            String phone = jwtUtil.extractPhone(jwt);
////phone != null &&
//            if ( SecurityContextHolder.getContext().getAuthentication() == null) {
////                UserDetails userDetails = userDetailsService.loadUserByUsername(phone);
//
//                if (jwtUtil.validateToken(jwt)) {
//                    UsernamePasswordAuthenticationToken token =
//                            new UsernamePasswordAuthenticationToken(null, null,null);
//
//                    token.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
//                    SecurityContextHolder.getContext().setAuthentication(token);
//                }
//            }
//        }
//        filterChain.doFilter(request, response);
//    }
//}
