package com.queue.chat_service.service;

import com.queue.chat_service.model.Conversation;
import com.queue.chat_service.model.Message;
import com.queue.chat_service.model.User;
import com.queue.chat_service.repository.ConversationRepository;
import com.queue.chat_service.repository.MessageRepository;
import com.queue.chat_service.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageService {
    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    public User provisionChatUser(String userId, String username, String phone) {
        if (userId == null || userId.trim().isEmpty()) {
            logger.error("Attempted to provision user with null or empty userId.");
            throw new IllegalArgumentException("User ID cannot be null or empty.");
        }

        if (phone == null || phone.trim().isEmpty()) {
            logger.warn("Attempted to provision user with null or empty phone for ID: {}", userId);
        }
        Optional<User> existingUser = userRepository.findById(userId);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            logger.info("Updating existing chat user: {}", userId);
            user.setUsername(username);
            user.setPhone(phone); // Ensure phone is consistent
            user.setLastOnline(LocalDateTime.now()); // Update last online time
            logger.debug("Updated user details: {}", user);
            return userRepository.save(user); // Save updated existing user
        } else {

            logger.info("Provisioning new chat user: {}", userId);

            User newUser = new User(userId, username, phone); // This constructor should set createdAt, lastOnline, empty conversations
            newUser.setCreatedAt(LocalDateTime.now()); // Ensure this is set on creation
            newUser.setLastOnline(LocalDateTime.now()); // Set initial last online
            newUser.setActiveConversationIds(new ArrayList<> ()); // Initialize as empty list

            logger.debug("New user created: {}", newUser);
            return userRepository.save(newUser); // Save new user
        }
    }
    public Optional<User> findUserById(String userId) {
        return userRepository.findById(userId);
    }

    public List<User> findAllUsersExcept(String currentUserId) {
//        return userRepository.findAll().stream()
//                .filter(u -> !u.getId().equals(currentUserId))
//                .collect(Collectors.toList());
        return userRepository.findAll();
    }
    public void updateLastOnline(String userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setLastOnline(LocalDateTime.now());
            userRepository.save(user);
        });
    }

    public Conversation getOrCreateOneToOneConversation(String user1Id, String user2Id) {
        // Ensure consistent order of participant IDs to query the unique constraint
        // This is important for findByParticipantsAndSize to work consistently for [A,B] and [B,A]
        List<String> sortedParticipants = Arrays.asList(user1Id, user2Id);
        Collections.sort(sortedParticipants); // Sort the IDs
        Set<String> participantsSet = new HashSet<>(sortedParticipants); // Create Set from sorted list

        Optional<Conversation> existingConversation = conversationRepository.findByParticipantsAndSize(participantsSet, 2);

        if (existingConversation.isPresent()) {
            return existingConversation.get();
        } else {
            Conversation newConversation = new Conversation(user1Id, user2Id); // Constructor handles adding to participants
            newConversation.setParticipants(participantsSet);
            newConversation = conversationRepository.save(newConversation);

            // Update user's activeConversationIds (add the new conversation ID to both users)
            Conversation finalNewConversation = newConversation;
            userRepository.findById(user1Id).ifPresent( u -> {
                u.getActiveConversationIds().add( finalNewConversation.getId());
                userRepository.save(u);
            });
            Conversation finalNewConversation1 = newConversation;
            userRepository.findById(user2Id).ifPresent( u -> {
                u.getActiveConversationIds().add( finalNewConversation1.getId());
                userRepository.save(u);
            });
            return newConversation;
        }
    }

    public List<Conversation> getUserConversations(String userId) {
        return conversationRepository.findByParticipantsContainingOrderByLastMessageTimestampDesc(userId);
    }

    // --- Message related methods ---

    public Message saveMessage(String conversationId, String senderId, String recipientId, String content) {
        // 1. Create the Message object
        Message newMessage = new Message(conversationId, senderId, recipientId, content);
        final Message savedMessage = messageRepository.save(newMessage); // Make it explicitly final or just 'Message savedMessage'
        conversationRepository.findById(conversationId).ifPresent(conv -> {
            conv.setLastMessageText(content);
            conv.setLastMessageSenderId(senderId);
            conv.setLastMessageTimestamp(savedMessage.getTimestamp()); // Use savedMessage here
            conv.getUnreadCounts().put(senderId, 0); // Sender has 'read' their own message
            conv.getUnreadCounts().compute(recipientId, (k, v) -> (v == null) ? 1 : v + 1); // Increment recipient's unread count
            conversationRepository.save(conv);
        });
        return savedMessage; // Return the saved message
    }
    public List<Message> getMessagesByConversationId(String conversationId) {
        return messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);
    }

    public void markMessagesAsRead(String conversationId, String readerId) {
        conversationRepository.findById(conversationId).ifPresent(conv -> {
            conv.getUnreadCounts().put(readerId, 0); // Set unread count for this reader to 0
            conversationRepository.save(conv);
        });
    }
}