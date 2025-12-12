package com.example.hr.controller;

import com.example.hr.model.StaffArchive;
import com.example.hr.repository.StaffArchiveRepository;
import com.example.hr.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Simple reports for HR_MANAGER:
 * - employeeCount, byTitle, turnoverRate
 */
@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final StaffArchiveRepository staffArchiveRepository;
    private final UserRepository userRepository;

    public ReportController(StaffArchiveRepository staffArchiveRepository, UserRepository userRepository) {
        this.staffArchiveRepository = staffArchiveRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('HR_MANAGER','ADMIN')")
    public ResponseEntity<?> summary() {
        List<StaffArchive> staff = staffArchiveRepository.findAll();
        int total = staff.size();
        Map<String, Long> byTitle = staff.stream()
                .collect(Collectors.groupingBy(s -> Optional.ofNullable(s.getTitle()).orElse("UNKNOWN"), Collectors.counting()));
        long leftCount = staff.stream().filter(s -> "DELETED".equalsIgnoreCase(s.getStatus())).count();
        double turnover = total == 0 ? 0.0 : (leftCount * 100.0 / total);
        // also show users by role counts
        Map<String, Long> usersByRole = userRepository.findAll().stream()
                .collect(Collectors.groupingBy(u -> Optional.ofNullable(u.getRole()).orElse("UNKNOWN"), Collectors.counting()));

        Map<String, Object> out = new HashMap<>();
        out.put("totalEmployees", total);
        out.put("byTitle", byTitle);
        out.put("leftCount", leftCount);
        out.put("turnoverRate", String.format("%.2f", turnover));
        out.put("usersByRole", usersByRole);
        return ResponseEntity.ok(out);
    }
}