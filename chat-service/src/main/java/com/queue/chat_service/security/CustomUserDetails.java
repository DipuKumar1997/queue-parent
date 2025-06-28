//package com.queue.chat_service.security; // <--- This should be its package
//
//import org.springframework.security.core.GrantedAuthority;
//import org.springframework.security.core.userdetails.User; // Import Spring Security's default UserDetails implementation
//import java.util.Collection; // For collections of authorities
//
//public class CustomUserDetails extends User {
//
//    private final String userId;        // The unique ID (e.g., UUID from your Auth Service)
//    private final String phoneNumber;   // The phone number of the user
//
//    public CustomUserDetails(String userId, String phoneNumber,
//                             Collection<? extends GrantedAuthority> authorities) {
//
//        super(userId, "", authorities);
//        this.userId = userId;
//        this.phoneNumber = phoneNumber;
//    }
//    public String getUserId() {
//        return userId;
//    }
//    public String getPhoneNumber() {
//        return phoneNumber;
//    }
//    @Override
//    public String toString() {
//        return "CustomUserDetails{" +
//                "userId='" + userId + '\'' +
//                ", phoneNumber='" + phoneNumber + '\'' +
//                // (", actualUsername='" + actualUsername + '\'') + // if applicable
//                "} " + super.toString(); // Include superclass toString for full details
//    }
//}
