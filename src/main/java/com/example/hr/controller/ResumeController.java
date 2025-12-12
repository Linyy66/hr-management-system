package com.example.hr.controller;

import com.example.hr.model.Resume;
import com.example.hr.repository.ResumeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 简历提交/编辑/审批接口
 */
@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeRepository resumeRepository;

    public ResumeController(ResumeRepository resumeRepository) {
        this.resumeRepository = resumeRepository;
    }

    // 员工创建简历（可为草稿或直接提交）
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> create(@RequestBody Resume payload, Authentication auth) {
        String username = auth.getName();
        Resume r = new Resume();
        r.setUsername(username);
        // 个人信息字段（前端会传）
        r.setFullName(payload.getFullName());
        r.setGender(payload.getGender());
        r.setBirthDate(payload.getBirthDate());
        r.setEducation(payload.getEducation());
        r.setExperience(payload.getExperience());
        r.setSkills(payload.getSkills());
        r.setMobile(payload.getMobile());
        r.setEmail(payload.getEmail());
        r.setAddress(payload.getAddress());
        r.setAppliedPositionIds(payload.getAppliedPositionIds());
        r.setCoverLetter(payload.getCoverLetter());
        r.setStatus(payload.getStatus() == null ? "DRAFT" : payload.getStatus()); // DRAFT 或 PENDING
        r.setCreateTime(LocalDateTime.now());
        resumeRepository.save(r);
        return ResponseEntity.ok(r);
    }

    // 员工查看自己的简历列表
    @GetMapping("/mine")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<Resume> mine(Authentication auth) {
        return resumeRepository.findByUsername(auth.getName());
    }

    // 任意简历详情：HR/ADMIN 或 投递者本人可查看
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id, Authentication auth) {
        Optional<Resume> opt = resumeRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Resume r = opt.get();
        String username = auth != null ? auth.getName() : null;
        // 允许 HR / ADMIN / owner 查看
        if (username != null && (username.equals(r.getUsername())
                || auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HR_SPEC") || a.getAuthority().equals("ROLE_HR_MANAGER") || a.getAuthority().equals("ROLE_ADMIN")))) {
            return ResponseEntity.ok(r);
        }
        return ResponseEntity.status(403).body("没有权限查看该简历");
    }

    // 投递者本人更新自己的简历（或者 HR 可以在审批时修改状态）
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Resume payload, Authentication auth) {
        Optional<Resume> opt = resumeRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Resume r = opt.get();
        String username = auth.getName();
        boolean isHr = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_HR_SPEC") || a.getAuthority().equals("ROLE_HR_MANAGER") || a.getAuthority().equals("ROLE_ADMIN"));
        // 非 HR 只能是 owner 更新（个人信息或用来提交）
        if (!isHr && !username.equals(r.getUsername())) {
            return ResponseEntity.status(403).body("没有权限更新该简历");
        }
        // 更新可变字段（HR 也可以更新 status）
        r.setFullName(payload.getFullName());
        r.setGender(payload.getGender());
        r.setBirthDate(payload.getBirthDate());
        r.setEducation(payload.getEducation());
        r.setExperience(payload.getExperience());
        r.setSkills(payload.getSkills());
        r.setMobile(payload.getMobile());
        r.setEmail(payload.getEmail());
        r.setAddress(payload.getAddress());
        r.setAppliedPositionIds(payload.getAppliedPositionIds());
        r.setCoverLetter(payload.getCoverLetter());
        if (isHr && payload.getStatus() != null) {
            r.setStatus(payload.getStatus());
        } else if (!isHr && payload.getStatus() != null) {
            // 普通用户只能提交状态为 PENDING（提交申请）
            if ("PENDING".equals(payload.getStatus())) r.setStatus("PENDING");
        }
        r.setUpdateTime(LocalDateTime.now());
        resumeRepository.save(r);
        return ResponseEntity.ok(r);
    }

    // HR / ADMIN 查看全部简历（审批列表）
    @GetMapping
    @PreAuthorize("hasAnyRole('HR_SPEC','HR_MANAGER','ADMIN')")
    public List<Resume> listForHr() {
        return resumeRepository.findAll();
    }

    // HR / ADMIN 审批通过
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('HR_SPEC','HR_MANAGER','ADMIN')")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        Optional<Resume> opt = resumeRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Resume r = opt.get();
        r.setStatus("APPROVED");
        r.setUpdateTime(LocalDateTime.now());
        resumeRepository.save(r);
        return ResponseEntity.ok(r);
    }

    // HR / ADMIN 驳回
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('HR_SPEC','HR_MANAGER','ADMIN')")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        Optional<Resume> opt = resumeRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        Resume r = opt.get();
        r.setStatus("REJECTED");
        r.setUpdateTime(LocalDateTime.now());
        resumeRepository.save(r);
        return ResponseEntity.ok(r);
    }
}