package com.queue.chat_service.config;

//import com.queue.chat_service.security.TokenAuthenticationFilter;
//import com.queue.chat_service.security.TokenAuthenticationFilter;
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
//
//    @Autowired
//    private TokenAuthenticationFilter tokenAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf( AbstractHttpConfigurer::disable ) // Disable CSRF for stateless API
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/ws/**").permitAll ()
                        .requestMatchers("/api/**").permitAll()
                        .anyRequest().permitAll ()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // Use stateless sessions for JWT
                );
//        http.addFilterBefore(tokenAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
    @Bean
    public UserDetailsService userDetailsService() {
        UserDetails user = User.withUsername("dummyUser")
                .password("{noop}dummyPassword") // {noop} means no password encoding
                .roles("NONE") // No roles needed for this dummy user
                .build();
        return new InMemoryUserDetailsManager(user);
    }
//    @Bean
//    public CorsFilter corsFilter() {
//        CorsConfiguration config = new CorsConfiguration();
//        config.setAllowedOrigins(List.of("http://localhost:5500","http://127.0.0.1:5500"));
//        config.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
//        config.setAllowedHeaders(List.of("*"));
//        config.setAllowCredentials(true);
//
//        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
//        source.registerCorsConfiguration("/**", config);
//        return new CorsFilter(source);
//    }

}