package com.example.hr.init;

import com.example.hr.model.AppUser;
import com.example.hr.model.Role;
import com.example.hr.repository.RoleRepository;
import com.example.hr.repository.UserRepository;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, RoleRepository roleRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private void createRoleIfNotExists(String name) {
        String n = name.trim().toUpperCase();
        if (!roleRepository.existsByName(n)) {
            Role r = new Role();
            r.setName(n);
            roleRepository.save(r);
            System.out.println("Created role: " + n);
        }
    }

    private void createUserIfNotExists(String username, String rawPassword, String role) {
        if (!userRepository.existsById(username)) {
            AppUser u = new AppUser();
            u.setUsername(username);
            u.setPassword(passwordEncoder.encode(rawPassword)); // 确保密码是加密的
            u.setRole(role);
            u.setEnabled(true);
            userRepository.save(u);
            System.out.println("Created default user: " + username + " / role=" + role);
        }
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // ensure roles exist
        createRoleIfNotExists("ADMIN");
        createRoleIfNotExists("HR_SPEC");
        createRoleIfNotExists("HR_MANAGER");
        createRoleIfNotExists("EMPLOYEE");

        // ensure default accounts exist with highest privileges
        createUserIfNotExists("admin", "adminpass", "ADMIN");
        createUserIfNotExists("spec", "specpass", "HR_SPEC");
        createUserIfNotExists("mgr", "mgrpass", "HR_MANAGER");
    }
}