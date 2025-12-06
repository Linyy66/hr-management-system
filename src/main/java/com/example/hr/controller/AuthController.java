package com.example.hr.controller;

import com.example.hr.model.AppUser;
import com.example.hr.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * 管理员创建用户（员工/人事专员/人事经理）
     * 请求示例:
     * POST /api/auth/register
     * {
     *   "username":"spec",
     *   "password":"specpass",
     *   "role":"HR_SPEC"      // 可选: EMPLOYEE / HR_SPEC / HR_MANAGER
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String rawPassword = body.get("password");
        String role = body.get("role");

        if (username == null || rawPassword == null || role == null) {
            return ResponseEntity.badRequest().body("username/password/role 必填");
        }
        // 允许的角色检查（可根据需要扩展）
        if (!role.equals("EMPLOYEE") && !role.equals("HR_SPEC") && !role.equals("HR_MANAGER") && !role.equals("ADMIN")) {
            return ResponseEntity.badRequest().body("role 必须是 EMPLOYEE/HR_SPEC/HR_MANAGER/ADMIN");
        }
        if (userRepository.existsById(username)) {
            return ResponseEntity.status(409).body("用户已存在");
        }
        AppUser u = new AppUser();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(rawPassword));
        u.setRole(role);
        u.setEnabled(true);
        userRepository.save(u);
        return ResponseEntity.ok(Map.of("result","ok","username", username,"role",role));
    }
}