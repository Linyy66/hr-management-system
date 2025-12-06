package com.example.hr.service;

import com.example.hr.model.AppUser;
import com.example.hr.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder;

    public CustomUserDetailsService(UserRepository userRepository,
                                    org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // first try database
        Optional<AppUser> opt = userRepository.findById(username);
        if (opt.isPresent()) {
            AppUser u = opt.get();
            List<GrantedAuthority> auths = List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole()));
            return new User(u.getUsername(), u.getPassword(), u.isEnabled(),
                    true, true, true, auths);
        }

        // fallback: built-in admin account (so admin/adminpass always works unless you created admin in DB)
        if ("admin".equals(username)) {
            String encoded = passwordEncoder.encode("adminpass");
            List<GrantedAuthority> auths = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
            return new User("admin", encoded, true, true, true, true, auths);
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}