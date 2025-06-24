package com.queue.chat_service.contoller;

//import com.chat.app.model.User;
//import com.chat.app.service.MessageService;
import com.queue.chat_service.model.User;
import com.queue.chat_service.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users") // A base path for user-related REST endpoints
//@CrossOrigin(origins = "http://localhost:3000") // Allow your React app to connect
public class UserController {

    @Autowired
    private MessageService messageService;

    //@RequestBody User userDetailsFromAuth
    @PostMapping("/provision")
    public ResponseEntity<User> provisionUser(
            @AuthenticationPrincipal String userId,
            // Make username and phone optional, so the request doesn't fail if the header is missing
            @RequestHeader(value = "X-User-Name", required = false) Optional<String> username,
            @RequestHeader(value = "X-User-Phone", required = false) Optional<String> phone

    ) {
        System.out.println("Attempting to provision user with ID: " + userId +
                ", Username: " + username + ", Phone: " + phone);

        String actualUsername = username.orElse(null);
        String actualPhone = phone.orElse(null);
        // userDetailsFromAuth should contain id (UUID string), username, and phone from the Auth Service
        User provisionedUser = messageService.provisionChatUser(userId, actualUsername, actualPhone);
        if (provisionedUser == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new User()); // Return an empty user or specific error DTO
        }
        return ResponseEntity.ok(provisionedUser);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal String userId) {
        return messageService.findUserById(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/getAllUsers")
    public ResponseEntity<List<User>> getAllOtherUsers(@AuthenticationPrincipal String currentUserId) {
        System.out.println (currentUserId);
        List<User> users = messageService.findAllUsersExcept(currentUserId);
        return ResponseEntity.ok(users);
    }
}