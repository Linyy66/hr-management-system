package com.example.hr.controller;

import com.example.hr.model.AppUser;
import com.example.hr.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
     * 注册用户：
     * - 如果 role == "EMPLOYEE"：任何人都可以自助注册（公开接口）
     * - 如果 role != "EMPLOYEE"：只有已认证且具有 ADMIN 权限的用户可注册（由后端在运行时检查 Authentication）
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String rawPassword = body.get("password");
        String role = body.get("role");

        if (username == null || rawPassword == null || role == null) {
            return ResponseEntity.badRequest().body("username/password/role 必填");
        }

        // 允许的角色
        if (!role.equals("EMPLOYEE") && !role.equals("HR_SPEC") && !role.equals("HR_MANAGER") && !role.equals("ADMIN")) {
            return ResponseEntity.badRequest().body("role 必须是 EMPLOYEE/HR_SPEC/HR_MANAGER/ADMIN");
        }

        // 非 EMPLOYEE 角色需要管理员权限
        if (!"EMPLOYEE".equals(role)) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                return ResponseEntity.status(403).body("仅管理员可以创建此角色的用户");
            }
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

    /**
     * 返回当前认证用户信息（需要 Basic Auth）
     * 例如：{ "username":"spec", "role":"HR_SPEC" }
     */
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).body("未认证");
        }
        String username = auth.getName();
        AppUser user = userRepository.findById(username).orElse(null);
        if (user != null) {
            return ResponseEntity.ok(Map.of("username", user.getUsername(), "role", user.getRole()));
        }
        // 如果 DB 中没有记录，但用户名是 admin（极少数场景），回退为 ADMIN
        if ("admin".equals(username)) {
            return ResponseEntity.ok(Map.of("username", "admin", "role", "ADMIN"));
        }
        // 未在 DB 中找到（应当不常见）
        return ResponseEntity.status(404).body("用户未找到");
    }
}