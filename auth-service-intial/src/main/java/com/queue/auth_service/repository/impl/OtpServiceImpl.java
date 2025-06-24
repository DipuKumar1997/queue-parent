package com.queue.auth_service.repository.impl;

import com.queue.auth_service.Entity.OtpRequestLog;
import com.queue.auth_service.repository.OtpRequestLogRepository;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Builder
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private final OtpRequestLogRepository otpRepo;


    public void sendOtpToPhone(String phone) {
        String otp = generateOtp();

        otpRepo.save(OtpRequestLog.builder()
                .phone(phone)
                .otp(otp)
                .createdAt(LocalDateTime.now())
                .used(false)
                .build());

        System.out.println("OTP sent to " + phone + ": " + otp); // Or use SMS gateway
    }

    @Override
    public void sendOtp(String phoneNumber, String otp) {

    }

    @Override
    public boolean verifyOtp(String phone, String otp) {
        Optional<OtpRequestLog> latestOtp = otpRepo.findTopByPhoneOrderByCreatedAtDesc(phone);
        if (latestOtp.isEmpty()) return false;
        OtpRequestLog record = latestOtp.get();
        // Optional: Check if expired (e.g., older than 5 mins)
        if (record.isUsed() || record.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(5)))
            return false;
        boolean matched = record.getOtp().equals(otp);
        if (matched) {
            record.setUsed(true);
            otpRepo.save(record);
        }
        return matched;
    }

    private String generateOtp() {
        return String.valueOf((int)(Math.random() * 900_000) + 100_000);
    }
}
