package com.queue.auth_service.repository;

import com.queue.auth_service.Entity.Token;
import com.queue.auth_service.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
//import org.springframework.security.core.userdetails.User;

import java.util.List;

public interface TokenRepository extends JpaRepository<Token, Long> {
    List<Token> findByUser(User user);
}
