package com.example.hr.controller;

import com.example.hr.model.Role;
import com.example.hr.repository.RoleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/roles")
@PreAuthorize("hasRole('ADMIN')") // only admin can manage roles
public class RoleController {

    private final RoleRepository roleRepository;

    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @GetMapping
    public List<Role> list() {
        return roleRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            return ResponseEntity.badRequest().body("name 必填");
        }
        name = name.trim().toUpperCase();
        if (roleRepository.existsByName(name)) {
            return ResponseEntity.status(409).body("角色已存在");
        }
        Role r = new Role();
        r.setName(name);
        r = roleRepository.save(r);
        return ResponseEntity.created(URI.create("/api/roles/" + r.getId())).body(r);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Optional<Role> opt = roleRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        roleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Role> opt = roleRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        String name = body.get("name");
        if (name == null || name.isBlank()) return ResponseEntity.badRequest().body("name 必填");
        name = name.trim().toUpperCase();
        // check duplicate name (other id)
        Optional<Role> exist = roleRepository.findByName(name);
        if (exist.isPresent() && !exist.get().getId().equals(id)) {
            return ResponseEntity.status(409).body("角色名已被使用");
        }
        Role r = opt.get();
        r.setName(name);
        roleRepository.save(r);
        return ResponseEntity.ok(r);
    }
}