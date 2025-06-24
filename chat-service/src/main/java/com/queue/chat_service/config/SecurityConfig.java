package com.queue.chat_service.config;

import com.queue.chat_service.security.TokenAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.security.core.userdetails.User; // New import
import org.springframework.security.core.userdetails.UserDetails; // New import
import org.springframework.security.core.userdetails.UserDetailsService; // New import
import org.springframework.security.provisioning.InMemoryUserDetailsManager; // New import


import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private TokenAuthenticationFilter tokenAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf( AbstractHttpConfigurer::disable ) // Disable CSRF for stateless API
                .authorizeHttpRequests(authorize -> authorize
                        // Allow WebSocket endpoint without authentication (handshake and initial connect)
                        .requestMatchers("/ws/**").permitAll()
                        // Allow user provisioning endpoint without authentication (only for new users from auth service)
                        .requestMatchers("/api/**").permitAll()
                        // All other API requests require authentication
//                        .requestMatchers("/api/v1/**").authenticated()
                        // Deny all other requests by default (if not covered by .authenticated())
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Use stateless sessions for JWT
                );

        // Add our custom token validation filter before Spring Security's default filter
        http.addFilterBefore(tokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Configure CORS for the entire application
//    @Bean
//    public CorsFilter corsFilter() {
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        CorsConfiguration config = new CorsConfiguration();
//        config.setAllowCredentials(true);
//        config.setAllowedOriginPatterns(List.of("http://localhost:3000", "http://your-frontend-domain.com"));
//        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
//        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
//        config.setExposedHeaders(List.of("Authorization"));
//        source.registerCorsConfiguration("/**", config);
//        return new CorsFilter(source); // Corrected this line as discussed previously
//    }

    /**
     * Provides a minimal UserDetailsService bean to prevent Spring Security from
     * generating a default in-memory user and its random password.
     * This UserDetailsService is not used for actual authentication by our TokenAuthenticationFilter,
     * but it satisfies Spring Security's auto-configuration requirements.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        // Create a dummy user. Its details won't be used for actual authentication
        // because our TokenAuthenticationFilter bypasses the standard authentication providers.
        // It simply exists to signal to Spring Security that a UserDetailsService is present.
        UserDetails user = User.withUsername("dummyUser")
                .password("{noop}dummyPassword") // {noop} means no password encoding
                .roles("NONE") // No roles needed for this dummy user
                .build();
        return new InMemoryUserDetailsManager(user);
    }
}