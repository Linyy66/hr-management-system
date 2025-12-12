package com.example.hr.controller;

import com.example.hr.model.LeaveRequest;
import com.example.hr.repository.LeaveRequestRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Leave request endpoints:
 * - POST /api/leaves : employee create
 * - GET /api/leaves/mine : employee list
 * - GET /api/leaves : HR list (filter by status optional)
 * - PUT /api/leaves/{id}/approve|/reject : HR approve/reject
 */
@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveRequestRepository leaveRepo;

    public LeaveController(LeaveRequestRepository leaveRepo) {
        this.leaveRepo = leaveRepo;
    }

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> create(@RequestBody LeaveRequest payload, Authentication auth) {
        LeaveRequest r = new LeaveRequest();
        r.setUsername(auth.getName());
        r.setStartDate(payload.getStartDate());
        r.setEndDate(payload.getEndDate());
        r.setReason(payload.getReason());
        r.setType(payload.getType() != null ? payload.getType() : "OTHER");
        r.setStatus("PENDING");
        r.setCreateTime(LocalDateTime.now());
        LeaveRequest saved = leaveRepo.save(r);
        return ResponseEntity.created(URI.create("/api/leaves/" + saved.getId())).body(saved);
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<LeaveRequest> mine(Authentication auth) {
        return leaveRepo.findByUsername(auth.getName());
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR_SPEC','HR_MANAGER','ADMIN')")
    public List<LeaveRequest> list(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) return leaveRepo.findByStatus(status);
        return leaveRepo.findAll();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HR_SPEC','HR_MANAGER','ADMIN')")
    public ResponseEntity<?> approve(@PathVariable Long id, Authentication auth) {
        Optional<LeaveRequest> opt = leaveRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        LeaveRequest r = opt.get();
        r.setStatus("APPROVED");
        r.setReviewer(auth.getName());
        r.setReviewTime(LocalDateTime.now());
        leaveRepo.save(r);
        return ResponseEntity.ok(r);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('HR_SPEC','HR_MANAGER','ADMIN')")
    public ResponseEntity<?> reject(@PathVariable Long id, Authentication auth) {
        Optional<LeaveRequest> opt = leaveRepo.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        LeaveRequest r = opt.get();
        r.setStatus("REJECTED");
        r.setReviewer(auth.getName());
        r.setReviewTime(LocalDateTime.now());
        leaveRepo.save(r);
        return ResponseEntity.ok(r);
    }
}