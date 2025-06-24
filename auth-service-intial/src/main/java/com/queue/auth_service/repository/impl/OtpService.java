package com.queue.auth_service.repository.impl;

public interface OtpService  {
    void sendOtp(String phoneNumber, String otp);
    boolean verifyOtp(String phoneNumber, String otp);
}
