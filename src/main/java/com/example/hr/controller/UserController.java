package com.example.hr.controller;

import com.example.hr.model.AppUser;
import com.example.hr.repository.UserRepository;
import com.example.hr.repository.RoleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Admin-only user management API.
 */
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, RoleRepository roleRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Return user DTO without password
    public static record UserDto(String username, String role, boolean enabled) {}

    @GetMapping
    public List<UserDto> list() {
        return userRepository.findAll().stream()
                .map(u -> new UserDto(u.getUsername(), u.getRole(), u.isEnabled()))
                .collect(Collectors.toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        String username = Optional.ofNullable(body.get("username")).map(String::trim).orElse(null);
        String password = body.get("password");
        String role = Optional.ofNullable(body.get("role")).map(String::trim).orElse(null);

        if (username == null || password == null || role == null) {
            return ResponseEntity.badRequest().body("username/password/role 必填");
        }
        if (userRepository.existsById(username)) {
            return ResponseEntity.status(409).body("用户已存在");
        }
        // optionally check role exists
        if (!roleRepository.existsByName(role)) {
            return ResponseEntity.badRequest().body("未知角色: " + role);
        }
        AppUser u = new AppUser();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(password));
        u.setRole(role);
        u.setEnabled(true);
        userRepository.save(u);
        return ResponseEntity.created(URI.create("/api/users/" + username)).body(Map.of("username", username, "role", role));
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<?> delete(@PathVariable String username) {
        // protect admin account
        if ("admin".equals(username)) {
            return ResponseEntity.status(403).body("禁止删除 admin 账户");
        }
        if (!userRepository.existsById(username)) return ResponseEntity.notFound().build();
        userRepository.deleteById(username);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{username}")
    public ResponseEntity<?> update(@PathVariable String username, @RequestBody Map<String, Object> body) {
        Optional<AppUser> opt = userRepository.findById(username);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        AppUser u = opt.get();
        if (body.containsKey("role")) {
            String newRole = String.valueOf(body.get("role"));
            if (!roleRepository.existsByName(newRole)) {
                return ResponseEntity.badRequest().body("未知角色: " + newRole);
            }
            u.setRole(newRole);
        }
        if (body.containsKey("enabled")) {
            u.setEnabled(Boolean.parseBoolean(String.valueOf(body.get("enabled"))));
        }
        if (body.containsKey("password") && body.get("password") != null && !String.valueOf(body.get("password")).isBlank()) {
            u.setPassword(passwordEncoder.encode(String.valueOf(body.get("password"))));
        }
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("username", u.getUsername(), "role", u.getRole(), "enabled", u.isEnabled()));
    }
}