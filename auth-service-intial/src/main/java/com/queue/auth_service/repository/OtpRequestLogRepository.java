package com.queue.auth_service.repository;

import com.queue.auth_service.Entity.OtpRequestLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public abstract interface OtpRequestLogRepository extends JpaRepository<OtpRequestLog, Long> {
    Optional<OtpRequestLog> findTopByPhoneOrderByCreatedAtDesc(String phone);

}
