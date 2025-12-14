package com.example.hr.controller;

import com.example.hr.model.AppUser;
import com.example.hr.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Optional;

@Controller
public class MainController {
    
    @Autowired
    private UserRepository userRepository;
    
    @GetMapping({"/index", "/index.html"})
    public String index(Model model) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            String username = auth.getName();
            Optional<AppUser> userOpt = userRepository.findById(username);
            
            String role = "UNKNOWN";
            if (userOpt.isPresent()) {
                role = userOpt.get().getRole();
            } else if ("admin".equals(username)) {
                role = "ADMIN";
            }
            
            switch (role) {
                case "ADMIN":
                    return "redirect:/admin/index.html";
                case "HR_MANAGER":
                    return "redirect:/hr_manager/index.html";
                case "HR_SPEC":
                    return "redirect:/hr_spec/index.html";
                case "EMPLOYEE":
                    return "redirect:/employee/index.html";
                default:
                    model.addAttribute("error", "未知角色");
                    return "login";
            }
        }
        
        return "redirect:/login.html";
    }
}