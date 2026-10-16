//package com.queue.auth_service.security;//package com.queue.auth_service.security;
//
//import com.queue.auth_service.Entity.User;
//import com.queue.auth_service.repository.UserRepository;
//import lombok.RequiredArgsConstructor;
////import org.springframework.security.core.userdetails.User;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class CustomUserDetailsService implements UserDetailsService {
//    private final UserRepository userRepo;
//    @Override
//    public UserDetails loadUserByUsername(String phone) throws UsernameNotFoundException {
//        User user = userRepo.findByPhone(phone)
//                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
//
//        return org.springframework.security.core.userdetails.User
//                .withUsername(user.getPhone())
//                .password("") // if password is not used, leave blank
//                .authorities("USER")
//                .build();
//    }
//}
