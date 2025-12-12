package com.example.hr.controller;

import com.example.hr.model.Position;
import com.example.hr.repository.PositionRepository;
import com.example.hr.repository.OrgLevel3Repository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/positions")
public class PositionController {

    private final PositionRepository positionRepository;
    private final OrgLevel3Repository org3Repository; // 新增三级机构仓库依赖

    // 构造函数注入两个仓库
    public PositionController(PositionRepository positionRepository, OrgLevel3Repository org3Repository) {
        this.positionRepository = positionRepository;
        this.org3Repository = org3Repository;
    }


    // 查询所有职位
    @GetMapping
    public List<Position> list() {
        return positionRepository.findAll();
    }

    // 根据ID查询职位
    @GetMapping("/{id}")
    public ResponseEntity<Position> get(@PathVariable String id) {
        return positionRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 新增职位（自动维护创建人、创建时间）
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> create(@RequestBody Position position, Authentication auth) {
        // 校验三级机构是否存在
        if (!org3Repository.existsById(position.getOrg3Id())) {
            return ResponseEntity.badRequest().body("关联的三级机构不存在");
        }
        // 校验主键非空
        if (position.getPositionId() == null || position.getPositionId().isBlank()) {
            return ResponseEntity.badRequest().body("positionId 必填");
        }
        // 校验关联的三级机构ID非空（数据库约束非空）
        if (position.getOrg3Id() == null || position.getOrg3Id().isBlank()) {
            return ResponseEntity.badRequest().body("org3Id（三级机构ID）必填");
        }
        // 校验职位名称非空（数据库约束非空）
        if (position.getPositionName() == null || position.getPositionName().isBlank()) {
            return ResponseEntity.badRequest().body("positionName（职位名称）必填");
        }

        // 自动填充创建人（当前登录用户）和创建时间
        position.setCreateBy(auth.getName());
        position.setCreateTime(LocalDateTime.now());
        // 初始化版本号（避免null）
        if (position.getVersion() == null) {
            position.setVersion(1);
        }

        Position saved = positionRepository.save(position);
        return ResponseEntity.created(URI.create("/api/positions/" + saved.getPositionId())).body(saved);
    }

    // 更新职位（自动维护更新人、更新时间）
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Position updated, Authentication auth) {
        return positionRepository.findById(id)
                .map(existing -> {
                    // 校验更新的三级机构是否存在
                    if (!org3Repository.existsById(updated.getOrg3Id())) {
                        return ResponseEntity.badRequest().body("关联的三级机构不存在");
                    }
                    // 校验更新的必填字段
                    if (updated.getOrg3Id() == null || updated.getOrg3Id().isBlank()) {
                        return ResponseEntity.badRequest().body("org3Id（三级机构ID）不能为空");
                    }
                    if (updated.getPositionName() == null || updated.getPositionName().isBlank()) {
                        return ResponseEntity.badRequest().body("positionName（职位名称）不能为空");
                    }

                    // 更新可修改字段
                    existing.setOrg3Id(updated.getOrg3Id());
                    existing.setPositionName(updated.getPositionName());
                    // 自动维护更新人（当前登录用户）和更新时间
                    existing.setUpdateBy(auth.getName());
                    existing.setUpdateTime(LocalDateTime.now());
                    // 乐观锁版本号自动递增
                    existing.setVersion(existing.getVersion() + 1);

                    Position saved = positionRepository.save(existing);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // 删除职位
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!positionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        positionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}