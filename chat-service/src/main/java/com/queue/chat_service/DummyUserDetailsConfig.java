package com.queue.chat_service;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.userdetails.UserDetailsService;

@Configuration
public class DummyUserDetailsConfig {
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> null;
    }
}