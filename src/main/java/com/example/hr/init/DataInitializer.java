package com.example.hr.init;

import com.example.hr.model.AppUser;
import com.example.hr.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private void createIfNotExists(String username, String rawPassword, String role) {
        if (!userRepository.existsById(username)) {
            AppUser u = new AppUser();
            u.setUsername(username);
            u.setPassword(passwordEncoder.encode(rawPassword));
            u.setRole(role);
            u.setEnabled(true);
            userRepository.save(u);
            System.out.println("Created default user: " + username + " / role=" + role);
        }
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        createIfNotExists("admin", "adminpass", "ADMIN");
        createIfNotExists("spec", "specpass", "HR_SPEC");
        createIfNotExists("mgr", "mgrpass", "HR_MANAGER");
    }
}