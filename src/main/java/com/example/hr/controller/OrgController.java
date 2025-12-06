package com.example.hr.controller;

import com.example.hr.model.OrgLevel1;
import com.example.hr.repository.OrgLevel1Repository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/org1")
public class OrgController {
    private final OrgLevel1Repository repo;

    public OrgController(OrgLevel1Repository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<OrgLevel1> list() {
        return repo.findAll();
    }

    @PostMapping
    public OrgLevel1 create(@RequestBody OrgLevel1 org) {
        return repo.save(org);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrgLevel1> get(@PathVariable String id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}