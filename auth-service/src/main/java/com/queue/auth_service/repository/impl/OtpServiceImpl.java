package com.queue.auth_service.repository.impl;

import com.queue.auth_service.Entity.OtpRequestLog;
import com.queue.auth_service.repository.OtpRequestLogRepository;
import com.queue.auth_service.repository.OtpService;
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
        System.out.println ("Sending OTP to phone: in OtpServiceImpl " + otp);
        OtpRequestLog o = otpRepo.findByPhone(phone).orElse(new OtpRequestLog());
        o.setPhone(phone);
        o.setOtp(otp);
        o.setCreatedAt(LocalDateTime.now());
        o.setUsed(false);
        otpRepo.save(o);

//        o.save(OtpRequestLog.builder()
//                .phone(phone)
//                .otp(otp)
//                .createdAt(LocalDateTime.now())
//                .used(false)
//                .build());

        System.out.println("OTP sent to " + phone + ": " + otp); // Or use SMS gateway
    }



    @Override
    public boolean verifyOtp(String phone, String otp) {

//        Optional<OtpRequestLog> latestOtp = otpRepo.findTopByPhoneOrderByCreatedAtDesc(phone);
        Optional<OtpRequestLog> latestOtp = otpRepo.findByPhoneAndOtp(phone,otp);
        System.out.println("latestOtp: " + latestOtp.get ().getOtp());
//        System.out.println (latestOtp.get ().getOtp());
        if (latestOtp.isEmpty()) return false;
        OtpRequestLog record = latestOtp.get();
        System.out.println ("record in OtpRequestLog : " + record);
        // Optional: Check if expired (e.g., older than 5 mins)
        if ( record.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(50)))
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
