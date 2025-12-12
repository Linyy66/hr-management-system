package com.example.hr.controller;

import com.example.hr.model.OrgLevel1;
import com.example.hr.model.OrgLevel2;
import com.example.hr.model.OrgLevel3;
import com.example.hr.repository.OrgLevel1Repository;
import com.example.hr.repository.OrgLevel2Repository;
import com.example.hr.repository.OrgLevel3Repository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    // 注入三个层级的Repository
    private final OrgLevel1Repository org1Repo;
    private final OrgLevel2Repository org2Repo;
    private final OrgLevel3Repository org3Repo;

    public OrganizationController(OrgLevel1Repository org1Repo, OrgLevel2Repository org2Repo, OrgLevel3Repository org3Repo) {
        this.org1Repo = org1Repo;
        this.org2Repo = org2Repo;
        this.org3Repo = org3Repo;
    }

    // ---------------------- 一级机构管理（仅ADMIN）----------------------
    @PostMapping("/level1")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrgLevel1> createOrg1(@RequestBody OrgLevel1 org1, Authentication auth) {
        org1.setCreateBy(auth.getName());
        org1.setCreateTime(LocalDateTime.now());
        org1.setVersion(1);
        OrgLevel1 saved = org1Repo.save(org1);
        return ResponseEntity.created(URI.create("/api/organizations/level1/" + saved.getOrg1Id())).body(saved);
    }

    @GetMapping("/level1")
    public List<OrgLevel1> listOrg1() {
        return org1Repo.findAll();
    }

    // ---------------------- 二级机构管理（ADMIN和HR_MANAGER）----------------------
    @PostMapping("/level2")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<OrgLevel2> createOrg2(@RequestBody OrgLevel2 org2, Authentication auth) {
        org2.setCreateBy(auth.getName());
        org2.setCreateTime(LocalDateTime.now());
        org2.setVersion(1);
        OrgLevel2 saved = org2Repo.save(org2);
        return ResponseEntity.created(URI.create("/api/organizations/level2/" + saved.getOrg2Id())).body(saved);
    }

    @GetMapping("/level2/{org1Id}")
    public List<OrgLevel2> listOrg2ByOrg1(@PathVariable String org1Id) {
        return org2Repo.findByOrg1Id(org1Id);
    }

    // ---------------------- 三级机构管理（ADMIN和HR_MANAGER）----------------------
    @PostMapping("/level3")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<OrgLevel3> createOrg3(@RequestBody OrgLevel3 org3, Authentication auth) {
        org3.setCreateBy(auth.getName());
        org3.setCreateTime(LocalDateTime.now());
        org3.setVersion(1);
        OrgLevel3 saved = org3Repo.save(org3);
        return ResponseEntity.created(URI.create("/api/organizations/level3/" + saved.getOrg3Id())).body(saved);
    }

    @GetMapping("/level3/{org2Id}")
    public List<OrgLevel3> listOrg3ByOrg2(@PathVariable String org2Id) {
        return org3Repo.findByOrg2Id(org2Id);
    }

    // 三级机构修改（仅HR_MANAGER和ADMIN）
    @PutMapping("/level3/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    public ResponseEntity<OrgLevel3> updateOrg3(@PathVariable String id, @RequestBody OrgLevel3 updated, Authentication auth) {
        return org3Repo.findById(id)
                .map(existing -> {
                    existing.setOrg3Name(updated.getOrg3Name());
                    existing.setUpdateBy(auth.getName());
                    existing.setUpdateTime(LocalDateTime.now());
                    existing.setVersion(existing.getVersion() + 1);
                    return ResponseEntity.ok(org3Repo.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}