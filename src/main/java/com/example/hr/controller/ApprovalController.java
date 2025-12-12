package com.example.hr.controller;

import com.example.hr.model.Approval;
import com.example.hr.repository.ApprovalRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Approval endpoints:
 * - HR_SPEC can submit promotion/transfer/recruitment proposals (POST /api/approvals)
 * - HR_MANAGER / ADMIN can list pending approvals and approve/reject
 * - Submitter can list their own submissions
 */
@RestController
@RequestMapping("/api/approvals")
public class ApprovalController {

    private final ApprovalRepository approvalRepository;

    public ApprovalController(ApprovalRepository approvalRepository) {
        this.approvalRepository = approvalRepository;
    }

    // Submit a proposal (HR_SPEC, HR_MANAGER or ADMIN can submit)
    @PostMapping
    @PreAuthorize("hasAnyRole('HR_SPEC','HR_MANAGER','ADMIN')")
    public ResponseEntity<?> submit(@RequestBody Approval payload, Authentication auth) {
        if (payload.getType() == null || payload.getType().isBlank()) {
            return ResponseEntity.badRequest().body("type 必填");
        }
        Approval a = new Approval();
        a.setType(payload.getType().trim().toUpperCase());
        a.setPayload(payload.getPayload());
        a.setSubmitter(auth.getName());
        a.setStatus("PENDING");
        a.setSubmitTime(LocalDateTime.now());
        Approval saved = approvalRepository.save(a);
        return ResponseEntity.created(URI.create("/api/approvals/" + saved.getId())).body(saved);
    }

    // List approvals for managers (HR_MANAGER and ADMIN). Optionally filter by status/type via query params.
    @GetMapping
    @PreAuthorize("hasAnyRole('HR_MANAGER','ADMIN')")
    public List<Approval> listForManagers(@RequestParam(required = false) String status,
                                          @RequestParam(required = false) String type) {
        if (status != null && !status.isBlank()) {
            return approvalRepository.findByStatus(status);
        }
        // no filter -> return all
        return approvalRepository.findAll();
    }

    // Submitter lists own submissions
    @GetMapping("/mine")
    @PreAuthorize("isAuthenticated()")
    public List<Approval> mine(Authentication auth) {
        return approvalRepository.findBySubmitter(auth.getName());
    }

    // Approve
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HR_MANAGER','ADMIN')")
    public ResponseEntity<?> approve(@PathVariable Long id, Authentication auth) {
        Optional<Approval> opt = approvalRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Approval a = opt.get();
        if ("APPROVED".equals(a.getStatus())) return ResponseEntity.badRequest().body("已批准");
        a.setStatus("APPROVED");
        a.setApprover(auth.getName());
        a.setApproveTime(LocalDateTime.now());
        approvalRepository.save(a);
        return ResponseEntity.ok(a);
    }

    // Reject
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('HR_MANAGER','ADMIN')")
    public ResponseEntity<?> reject(@PathVariable Long id, Authentication auth) {
        Optional<Approval> opt = approvalRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Approval a = opt.get();
        if ("REJECTED".equals(a.getStatus())) return ResponseEntity.badRequest().body("已驳回");
        a.setStatus("REJECTED");
        a.setApprover(auth.getName());
        a.setApproveTime(LocalDateTime.now());
        approvalRepository.save(a);
        return ResponseEntity.ok(a);
    }
}