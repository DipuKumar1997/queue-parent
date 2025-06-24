package com.queue.auth_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
public class OtpVerifyRequest {
    private String phone;
    private String otp;
}
