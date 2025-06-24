package com.queue.auth_service.repository;

public interface OtpService  {
//    void sendOtp(String phoneNumber, String otp);
    boolean verifyOtp(String phoneNumber, String otp);
}
