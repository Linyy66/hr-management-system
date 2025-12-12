package com.example.hr.controller;

import com.example.hr.model.AppUser;
import com.example.hr.model.StaffArchive;
import com.example.hr.repository.UserRepository;
import com.example.hr.repository.RoleRepository;
import com.example.hr.repository.StaffArchiveRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

/**
 * User management:
 * - Admin-only APIs for full management (class-level @PreAuthorize)
 * - HR-visible employee list for HR_SPEC / HR_MANAGER / ADMIN
 */
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')") // class-level default: admin-only for most endpoints
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final StaffArchiveRepository staffArchiveRepository;

    public UserController(UserRepository userRepository, RoleRepository roleRepository,
                          BCryptPasswordEncoder passwordEncoder,
                          StaffArchiveRepository staffArchiveRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.staffArchiveRepository = staffArchiveRepository;
    }

    // DTO for UI (no password)
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

    // ---------------- HR-visible employees list ----------------
    // This endpoint is visible to HR_SPEC, HR_MANAGER and ADMIN.
    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('HR_SPEC','HR_MANAGER','ADMIN')")
    public List<UserDto> listEmployees() {
        return userRepository.findAll().stream()
                .filter(u -> "EMPLOYEE".equals(u.getRole()))
                .map(u -> new UserDto(u.getUsername(), u.getRole(), u.isEnabled()))
                .collect(Collectors.toList());
    }

    // Optional: convert AppUser -> StaffArchive (HR_SPEC can call)
    @PostMapping("/employees/{username}/create-staff")
    @PreAuthorize("hasAnyRole('HR_SPEC','HR_MANAGER','ADMIN')")
    public ResponseEntity<?> createStaffFromUser(@PathVariable String username, @RequestBody Map<String, String> body) {
        Optional<AppUser> opt = userRepository.findById(username);
        if (opt.isEmpty()) return ResponseEntity.status(404).body("用户不存在");
        // ensure not duplicate staff archive id
        String archiveId = body.get("archiveId");
        if (archiveId == null || archiveId.isBlank()) {
            return ResponseEntity.badRequest().body("archiveId 必填");
        }
        if (staffArchiveRepository.existsById(archiveId)) {
            return ResponseEntity.status(409).body("档案ID 已存在");
        }
        StaffArchive s = new StaffArchive();
        s.setArchiveId(archiveId);
        s.setOrg1Id(body.getOrDefault("org1Id","01"));
        s.setOrg2Id(body.getOrDefault("org2Id","01"));
        s.setOrg3Id(body.getOrDefault("org3Id","01"));
        s.setPositionId(body.getOrDefault("positionId","UNKNOWN"));
        s.setTitle(body.getOrDefault("title","1"));
        s.setStaffName(body.getOrDefault("staffName", username));
        s.setGender(body.getOrDefault("gender","1"));
        s.setIdCard(body.getOrDefault("idCard",""));
        s.setMobile(body.getOrDefault("mobile",""));
        s.setStatus("NORMAL");
        s.setCreateBy(body.getOrDefault("createBy","hr_spec"));
        staffArchiveRepository.save(s);
        return ResponseEntity.ok(Map.of("result","ok","archiveId",archiveId));
    }
}