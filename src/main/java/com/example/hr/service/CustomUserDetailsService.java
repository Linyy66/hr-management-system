package com.example.hr.service;

import com.example.hr.model.AppUser;
import com.example.hr.model.UserPrincipal;
import com.example.hr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("Attempting to load user: " + username);
        
        // first try database
        Optional<AppUser> opt = userRepository.findById(username);
        if (opt.isPresent()) {
            AppUser u = opt.get();
            System.out.println("Found user in database: " + u.getUsername() + ", role: " + u.getRole());
            List<GrantedAuthority> auths = List.of(new SimpleGrantedAuthority("ROLE_" + u.getRole()));
            return new UserPrincipal(u.getUsername(), u.getPassword(), auths, u.isEnabled());
        }

        // fallback: built-in admin account (so admin/adminpass always works unless you created admin in DB)
        if ("admin".equals(username)) {
            System.out.println("Using fallback admin account");
            List<GrantedAuthority> auths = List.of(new SimpleGrantedAuthority("ROLE_ADMIN"));
            // 使用BCrypt加密密码
            String encoded = passwordEncoder.encode("adminpass");
            return new UserPrincipal("admin", encoded, auths, true);
        }

        throw new UsernameNotFoundException("User not found: " + username);
    }
}