package com.example.hr.controller;

import com.example.hr.dto.ApiResponse;
import com.example.hr.model.*;
import com.example.hr.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    private final OrgLevel1Repository orgLevel1Repository;
    private final OrgLevel2Repository orgLevel2Repository;
    private final OrgLevel3Repository orgLevel3Repository;
    private final PositionRepository positionRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AttendanceRuleRepository attendanceRuleRepository;
    
    public AdminController(OrgLevel1Repository orgLevel1Repository,
                           OrgLevel2Repository orgLevel2Repository,
                           OrgLevel3Repository orgLevel3Repository,
                           PositionRepository positionRepository,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           AttendanceRuleRepository attendanceRuleRepository) {
        this.orgLevel1Repository = orgLevel1Repository;
        this.orgLevel2Repository = orgLevel2Repository;
        this.orgLevel3Repository = orgLevel3Repository;
        this.positionRepository = positionRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.attendanceRuleRepository = attendanceRuleRepository;
    }
    
    // 组织架构管理 - 一级机构
    @GetMapping("/org/level1")
    public ResponseEntity<ApiResponse<List<OrgLevel1>>> getAllOrgLevel1() {
        List<OrgLevel1> orgs = orgLevel1Repository.findAll();
        return ResponseEntity.ok(ApiResponse.success(orgs));
    }
    
    @PostMapping("/org/level1")
    public ResponseEntity<ApiResponse<OrgLevel1>> createOrgLevel1(@RequestBody OrgLevel1 org) {
        org.setCreateTime(LocalDateTime.now());
        org.setUpdateTime(LocalDateTime.now());
        OrgLevel1 savedOrg = orgLevel1Repository.save(org);
        return ResponseEntity.ok(ApiResponse.success("一级机构创建成功", savedOrg));
    }
    
    @PutMapping("/org/level1/{id}")
    public ResponseEntity<ApiResponse<OrgLevel1>> updateOrgLevel1(@PathVariable String id, @RequestBody OrgLevel1 org) {
        return orgLevel1Repository.findById(id).map(existing -> {
            existing.setOrg1Name(org.getOrg1Name());
            existing.setUpdateTime(LocalDateTime.now());
            OrgLevel1 saved = orgLevel1Repository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("一级机构更新成功", saved));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/org/level1/{id}")
    public ResponseEntity<ApiResponse<String>> deleteOrgLevel1(@PathVariable String id) {
        if (!orgLevel1Repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orgLevel1Repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("一级机构删除成功"));
    }
    
    // 组织架构管理 - 二级机构
    @GetMapping("/org/level2")
    public ResponseEntity<ApiResponse<List<OrgLevel2>>> getAllOrgLevel2() {
        List<OrgLevel2> orgs = orgLevel2Repository.findAll();
        return ResponseEntity.ok(ApiResponse.success(orgs));
    }
    
    @PostMapping("/org/level2")
    public ResponseEntity<ApiResponse<OrgLevel2>> createOrgLevel2(@RequestBody OrgLevel2 org) {
        org.setCreateTime(LocalDateTime.now());
        org.setUpdateTime(LocalDateTime.now());
        OrgLevel2 savedOrg = orgLevel2Repository.save(org);
        return ResponseEntity.ok(ApiResponse.success("二级机构创建成功", savedOrg));
    }
    
    @PutMapping("/org/level2/{id}")
    public ResponseEntity<ApiResponse<OrgLevel2>> updateOrgLevel2(@PathVariable String id, @RequestBody OrgLevel2 org) {
        return orgLevel2Repository.findById(id).map(existing -> {
            existing.setOrg1Id(org.getOrg1Id());
            existing.setOrg2Name(org.getOrg2Name());
            existing.setUpdateTime(LocalDateTime.now());
            OrgLevel2 saved = orgLevel2Repository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("二级机构更新成功", saved));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/org/level2/{id}")
    public ResponseEntity<ApiResponse<String>> deleteOrgLevel2(@PathVariable String id) {
        if (!orgLevel2Repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orgLevel2Repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("二级机构删除成功"));
    }
    
    // 组织架构管理 - 三级机构
    @GetMapping("/org/level3")
    public ResponseEntity<ApiResponse<List<OrgLevel3>>> getAllOrgLevel3() {
        List<OrgLevel3> orgs = orgLevel3Repository.findAll();
        return ResponseEntity.ok(ApiResponse.success(orgs));
    }
    
    @PostMapping("/org/level3")
    public ResponseEntity<ApiResponse<OrgLevel3>> createOrgLevel3(@RequestBody OrgLevel3 org) {
        org.setCreateTime(LocalDateTime.now());
        org.setUpdateTime(LocalDateTime.now());
        OrgLevel3 savedOrg = orgLevel3Repository.save(org);
        return ResponseEntity.ok(ApiResponse.success("三级机构创建成功", savedOrg));
    }
    
    @PutMapping("/org/level3/{id}")
    public ResponseEntity<ApiResponse<OrgLevel3>> updateOrgLevel3(@PathVariable String id, @RequestBody OrgLevel3 org) {
        return orgLevel3Repository.findById(id).map(existing -> {
            existing.setOrg2Id(org.getOrg2Id());
            existing.setOrg3Name(org.getOrg3Name());
            existing.setUpdateTime(LocalDateTime.now());
            OrgLevel3 saved = orgLevel3Repository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("三级机构更新成功", saved));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/org/level3/{id}")
    public ResponseEntity<ApiResponse<String>> deleteOrgLevel3(@PathVariable String id) {
        if (!orgLevel3Repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        orgLevel3Repository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("三级机构删除成功"));
    }
    
    // 职位管理
    @GetMapping("/positions")
    public ResponseEntity<ApiResponse<List<Position>>> getAllPositions() {
        List<Position> positions = positionRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(positions));
    }
    
    @PostMapping("/positions")
    public ResponseEntity<ApiResponse<Position>> createPosition(@RequestBody Position position) {
        position.setCreateTime(LocalDateTime.now());
        position.setUpdateTime(LocalDateTime.now());
        Position savedPosition = positionRepository.save(position);
        return ResponseEntity.ok(ApiResponse.success("职位创建成功", savedPosition));
    }
    
    @PutMapping("/positions/{id}")
    public ResponseEntity<ApiResponse<Position>> updatePosition(@PathVariable String id, @RequestBody Position position) {
        return positionRepository.findById(id).map(existing -> {
            existing.setOrg3Id(position.getOrg3Id());
            existing.setPositionName(position.getPositionName());
            existing.setUpdateTime(LocalDateTime.now());
            Position saved = positionRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("职位更新成功", saved));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/positions/{id}")
    public ResponseEntity<ApiResponse<String>> deletePosition(@PathVariable String id) {
        if (!positionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        positionRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("职位删除成功"));
    }
    
    // 用户管理
    @GetMapping("/users")
    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }
    
    @PostMapping("/users")
    public AppUser createUser(@RequestBody AppUser user) {
        return userRepository.save(user);
    }
    
    @PutMapping("/users/{username}")
    public ResponseEntity<AppUser> updateUser(@PathVariable String username, @RequestBody AppUser user) {
        return userRepository.findById(username).map(existing -> {
            existing.setRole(user.getRole());
            existing.setEnabled(user.isEnabled());
            return ResponseEntity.ok(userRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/users/{username}")
    public ResponseEntity<Void> deleteUser(@PathVariable String username) {
        if (!userRepository.existsById(username)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(username);
        return ResponseEntity.noContent().build();
    }
    
    // 角色管理
    @GetMapping("/roles")
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }
    
    @PostMapping("/roles")
    public Role createRole(@RequestBody Role role) {
        return roleRepository.save(role);
    }
    
    @PutMapping("/roles/{id}")
    public ResponseEntity<Role> updateRole(@PathVariable Long id, @RequestBody Role role) {
        return roleRepository.findById(id).map(existing -> {
            existing.setName(role.getName());
            return ResponseEntity.ok(roleRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        if (!roleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        roleRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    // 考勤规则管理
    @GetMapping("/attendance-rules")
    public ResponseEntity<ApiResponse<List<AttendanceRule>>> getAllAttendanceRules() {
        List<AttendanceRule> rules = attendanceRuleRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(rules));
    }
    
    @PostMapping("/attendance-rules")
    public ResponseEntity<ApiResponse<AttendanceRule>> createAttendanceRule(@RequestBody AttendanceRule rule) {
        rule.setCreateTime(LocalDateTime.now());
        AttendanceRule savedRule = attendanceRuleRepository.save(rule);
        return ResponseEntity.ok(ApiResponse.success("考勤规则创建成功", savedRule));
    }
    
    @PutMapping("/attendance-rules/{id}")
    public ResponseEntity<ApiResponse<AttendanceRule>> updateAttendanceRule(@PathVariable Long id, @RequestBody AttendanceRule rule) {
        return attendanceRuleRepository.findById(id).map(existing -> {
            existing.setOrg1Id(rule.getOrg1Id());
            existing.setRuleJson(rule.getRuleJson());
            existing.setStatus(rule.getStatus());
            AttendanceRule saved = attendanceRuleRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("考勤规则更新成功", saved));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/attendance-rules/{id}")
    public ResponseEntity<ApiResponse<String>> deleteAttendanceRule(@PathVariable Long id) {
        if (!attendanceRuleRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        attendanceRuleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("考勤规则删除成功"));
    }
}