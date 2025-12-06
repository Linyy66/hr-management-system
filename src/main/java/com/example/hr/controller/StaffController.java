package com.example.hr.controller;

import com.example.hr.model.StaffArchive;
import com.example.hr.repository.StaffArchiveRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
public class StaffController {
    private final StaffArchiveRepository repo;

    public StaffController(StaffArchiveRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<StaffArchive> list() {
        return repo.findAll();
    }

    @PostMapping
    public StaffArchive create(@RequestBody StaffArchive archive) {
        // minimal: set status and createTime when new
        archive.setStatus("PENDING");
        archive.setCreateTime(LocalDateTime.now());
        return repo.save(archive);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffArchive> get(@PathVariable String id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffArchive> update(@PathVariable String id, @RequestBody StaffArchive payload) {
        return repo.findById(id).map(existing -> {
            // minimal update: update mutable fields (not archiveId, org/position)
            existing.setStaffName(payload.getStaffName());
            existing.setPhone(payload.getPhone());
            existing.setMobile(payload.getMobile());
            existing.setEmail(payload.getEmail());
            existing.setUpdateTime(LocalDateTime.now());
            existing.setStatus("PENDING"); // re-submit for review
            return ResponseEntity.ok(repo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }
}