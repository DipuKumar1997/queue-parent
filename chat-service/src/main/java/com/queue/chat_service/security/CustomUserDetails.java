package com.queue.chat_service.security;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class CustomUserDetails extends User {
    private final String userId;
    private final String phoneNumber;

    @JsonCreator
    public CustomUserDetails(
            @JsonProperty("userId") String userId,
            @JsonProperty("phoneNumber") String phoneNumber,
            @JsonProperty("authorities") Collection<? extends GrantedAuthority> authorities
    ) {
        super(userId, "", authorities); // Username is userId
        this.userId = userId;
        this.phoneNumber = phoneNumber;
    }

    public String getUserId() {
        return userId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    @Override
    public String toString() {
        return "CustomUserDetails{" +
                "userId='" + userId + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                "} " + super.toString();
    }
}
