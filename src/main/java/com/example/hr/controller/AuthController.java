package com.example.hr.controller;

import com.example.hr.model.AppUser;
import com.example.hr.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Controller
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    public AuthController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, 
                          ApplicationEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }

    /**
     * 注册用户（用于处理表单提交）
     * - 如果 role == "EMPLOYEE"：任何人都可以自助注册（公开接口）
     * - 如果 role != "EMPLOYEE"：只有已认证且具有 ADMIN 权限的用户可注册（由后端在运行时检查 Authentication）
     */
    @PostMapping(path = "/register", consumes = "application/x-www-form-urlencoded")
    public String registerFromForm(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password,
            @RequestParam(required = false) String role) {
        System.out.println("Register form request received: username=" + username + ", role=" + role);
        ResponseEntity<?> response = register(username, password, role);
        System.out.println("Register service response: " + response.getStatusCode());
        if (response.getStatusCode().is2xxSuccessful()) {
            System.out.println("Registration successful, redirecting to success page");
            return "redirect:/register.html?success=true";
        } else {
            Map<String, String> body = (Map<String, String>) response.getBody();
            String error = body != null ? body.get("error") : "注册失败";
            System.out.println("Registration failed: " + error);
            return "redirect:/register.html?error=" + error;
        }
    }

    /**
     * 注册用户（用于处理JSON请求）：
     * - 如果 role == "EMPLOYEE"：任何人都可以自助注册（公开接口）
     * - 如果 role != "EMPLOYEE"：只有已认证且具有 ADMIN 权限的用户可注册（由后端在运行时检查 Authentication）
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String password,
            @RequestParam(required = false) String role) {
        System.out.println("Register JSON request received: username=" + username + ", role=" + role);
        
        if (username == null || password == null || role == null) {
            System.out.println("Missing required fields: username=" + username + ", password=" + (password != null) + ", role=" + role);
            return ResponseEntity.badRequest().body(Map.of("error", "username/password/role 必填"));
        }

        // 允许的角色
        if (!role.equals("EMPLOYEE") && !role.equals("HR_SPEC") && !role.equals("HR_MANAGER") && !role.equals("ADMIN")) {
            System.out.println("Invalid role: " + role);
            return ResponseEntity.badRequest().body(Map.of("error", "role 必须是 EMPLOYEE/HR_SPEC/HR_MANAGER/ADMIN"));
        }

        // 非 EMPLOYEE 角色需要管理员权限
        if (!"EMPLOYEE".equals(role)) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                System.out.println("Non-employee role registration attempted without admin privileges");
                return ResponseEntity.status(403).body(Map.of("error", "仅管理员可以创建此角色的用户"));
            }
        }

        if (userRepository.existsById(username)) {
            System.out.println("Username already exists: " + username);
            return ResponseEntity.status(409).body(Map.of("error", "用户已存在"));
        }
        
        AppUser u = new AppUser();
        u.setUsername(username);
        u.setPassword(passwordEncoder.encode(password));
        u.setRole(role);
        u.setEnabled(true);
        AppUser savedUser = userRepository.save(u);
        System.out.println("User saved successfully: " + savedUser.getUsername() + ", role: " + savedUser.getRole());
        
        try {
            // 发布用户注册事件
            eventPublisher.publishEvent(savedUser);
            System.out.println("User registration event published for: " + savedUser.getUsername());
        } catch (Exception e) {
            System.err.println("Failed to publish user registration event for: " + savedUser.getUsername() + ", error: " + e.getMessage());
            e.printStackTrace();
        }
        return ResponseEntity.ok(Map.of("result","ok","username", username,"role",role));
    }

    /**
     * 返回当前认证用户信息（需要 Basic Auth）
     * 例如：{ "username":"spec", "role":"HR_SPEC" }
     */
    @GetMapping("/me")
    public ResponseEntity<?> me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // 直接使用Spring Security注入的Authentication对象
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            return ResponseEntity.status(401).body(Map.of("error", "未认证"));
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
        return ResponseEntity.status(404).body(Map.of("error", "用户未找到"));
    }
}