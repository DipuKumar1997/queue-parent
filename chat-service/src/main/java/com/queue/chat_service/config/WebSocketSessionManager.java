package com.queue.chat_service.config;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Manages WebSocket sessions, mapping user IDs to their active session IDs.
 * Allows a user to have multiple active sessions (e.g., from different devices).
 */
@Component
public class WebSocketSessionManager {

    // Map: userId -> Set of sessionId
    private final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>();
    // Map: sessionId -> userId (for quick lookup on disconnect)
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();

    /**
     * Adds a new WebSocket session for a user.
     * @param userId The UUID string of the user.
     * @param sessionId The unique ID of the WebSocket session.
     */
    public void addSession(String userId, String sessionId) {
        userSessions.computeIfAbsent(userId, k -> Collections.synchronizedSet(new HashSet<>())).add(sessionId);
        sessionToUser.put(sessionId, userId);
        System.out.println("Session added: User " + userId + ", Session " + sessionId);
    }

    /**
     * Removes a WebSocket session.
     * @param sessionId The unique ID of the WebSocket session to remove.
     */
    public void removeSession(String sessionId) {
        String userId = sessionToUser.remove(sessionId);
        if (userId != null) {
            Set<String> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(sessionId);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId); // Remove user entry if no active sessions
                }
            }
        }
        System.out.println("Session removed: Session " + sessionId + (userId != null ? " for User " + userId : ""));
    }

    /**
     * Retrieves all active session IDs for a given user.
     * @param userId The UUID string of the user.
     * @return A Set of session IDs. Returns an empty set if the user has no active sessions.
     */
    public Set<String> getSessionsForUser(String userId) {
        return userSessions.getOrDefault(userId, Collections.emptySet());
    }

    /**
     * Retrieves the user ID associated with a given session ID.
     * @param sessionId The unique ID of the WebSocket session.
     * @return The UUID string of the user, or null if no user is associated with the session.
     */
    public String getUserId(String sessionId) {
        return sessionToUser.get(sessionId);
    }
}