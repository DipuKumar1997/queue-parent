package com.queue.chat_service.config;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class WebSocketSessionManager {

    // Map: userId -> Set of sessionId
    private final Map<String, Set<String>> userSessions = new ConcurrentHashMap<>();
    // Map: sessionId -> userId (for quick lookup on disconnect)
    private final Map<String, String> sessionToUser = new ConcurrentHashMap<>();

    public void addSession(String userId, String sessionId) {
        userSessions.computeIfAbsent(userId, k -> Collections.synchronizedSet(new HashSet<>())).add(sessionId);
        sessionToUser.put(sessionId, userId);
        System.out.println("Session added: User " + userId + ", Session " + sessionId);
    }
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

    public Set<String> getSessionsForUser(String userId) {
        return userSessions.getOrDefault(userId, Collections.emptySet());
    }

    public String getUserId(String sessionId) {
        return sessionToUser.get(sessionId);
    }
}