package com.queue.chat_service.controller;


import com.queue.chat_service.model.User;
import com.queue.chat_service.security.CustomUserDetails;
import com.queue.chat_service.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @Autowired
    private MessageService messageService;
//  @RequestHeader("X-User-Id") String userId,
//   @RequestHeader(value = "X-User-Name", required = false) Optional<String> username,
//@RequestHeader(value = "X-User-Phone", required = false) Optional<String> phone
    @PostMapping("/provision")
    public ResponseEntity<User> provisionUser(
            @AuthenticationPrincipal CustomUserDetails principal
    ) {
        String userId = principal.getUserId();  // From CustomUserDetails
        String username = principal.getUsername(); // Typically same as userId
        String phone = principal.getPhoneNumber();    // Custom getter

        System.out.println("Attempting to provision user with ID: " + userId +
                ", Username: " + username + ", Phone: " + phone);

        String actualUsername = username;
        String actualPhone = phone;
        User provisionedUser = messageService.provisionChatUser(userId, actualUsername, actualPhone);
        if (provisionedUser == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new User()); // Return an empty user or specific error DTO
        }
        return ResponseEntity.ok(provisionedUser);
    }
//@AuthenticationPrincipal String userId
    @GetMapping("/me")
    public ResponseEntity<String> getCurrentUser() {
        String currentUserId = "some-user-id"; // TE
//        return messageService.findUserById(userId)
//                .map(ResponseEntity::ok)
//                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        return  ResponseEntity.ok (currentUserId);
    }

    @GetMapping("/getAllUsers")
    public ResponseEntity<?> getAllOtherUsers(@AuthenticationPrincipal CustomUserDetails principal) {
        System.out.println ("lets see what i et in currentUser Id: ");
        String currentUserId = principal.getUserId();
        System.out.println (currentUserId);
        List<User> users = messageService.findAllUsersExcept(currentUserId);
        return ResponseEntity.ok(users);
    }
}