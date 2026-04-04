package com.queue.chat_service.model;

public class StompUserPrincipal implements java.security.Principal {
    private final String userId;
    public StompUserPrincipal(String userId) {
        this.userId = userId;
    }
    @Override
    public String getName() {
        return this.userId; // This MUST not be null
    }
}