package com.queue.chat_service.repository;

import com.queue.chat_service.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByPhone(String phone); // Find user by phone number
}