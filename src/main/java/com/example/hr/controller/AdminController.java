package com.example.hr.controller;

import com.example.hr.dto.ApiResponse;
import com.example.hr.model.*;
import com.example.hr.repository.*;
import com.example.hr.service.OrgStructureService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

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
    private final OrgStructureService orgStructureService;
    
    public AdminController(OrgLevel1Repository orgLevel1Repository,
                           OrgLevel2Repository orgLevel2Repository,
                           OrgLevel3Repository orgLevel3Repository,
                           PositionRepository positionRepository,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           AttendanceRuleRepository attendanceRuleRepository,
                           OrgStructureService orgStructureService) {
        this.orgLevel1Repository = orgLevel1Repository;
        this.orgLevel2Repository = orgLevel2Repository;
        this.orgLevel3Repository = orgLevel3Repository;
        this.positionRepository = positionRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.attendanceRuleRepository = attendanceRuleRepository;
        this.orgStructureService = orgStructureService;
    }
    
    // 组织架构管理 - 一级机构
    @GetMapping("/org/level1")
    public ResponseEntity<ApiResponse<List<OrgLevel1>>> getAllOrgLevel1() {
        List<OrgLevel1> orgs = orgLevel1Repository.findAll();
        return ResponseEntity.ok(ApiResponse.success(orgs));
    }
    
    @PostMapping("/org/level1")
    public ResponseEntity<ApiResponse<OrgLevel1>> createOrgLevel1(@RequestBody OrgLevel1 org) {
        // 验证机构ID格式
        if (org.getOrg1Id() == null || org.getOrg1Id().length() != 2 || !org.getOrg1Id().matches("\\d{2}")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("一级机构ID必须为2位数字"));
        }
        
        // 检查机构代码是否已存在
        if (orgLevel1Repository.existsById(org.getOrg1Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("机构代码已存在"));
        }
        
        org.setCreateTime(LocalDateTime.now());
        org.setUpdateTime(LocalDateTime.now());
        org.setCreateBy("admin"); // 在实际应用中应该从安全上下文中获取当前用户
        org.setUpdateBy("admin");
        OrgLevel1 savedOrg = orgLevel1Repository.save(org);
        return ResponseEntity.ok(ApiResponse.success("一级机构创建成功", savedOrg));
    }
    
    @PutMapping("/org/level1/{id}")
    public ResponseEntity<ApiResponse<OrgLevel1>> updateOrgLevel1(@PathVariable String id, @RequestBody OrgLevel1 org) {
        return orgLevel1Repository.findById(id).map(existing -> {
            existing.setOrg1Name(org.getOrg1Name());
            existing.setOrgHead(org.getOrgHead());
            existing.setOrgDesc(org.getOrgDesc());
            existing.setEffectiveDate(org.getEffectiveDate());
            existing.setUpdateTime(LocalDateTime.now());
            existing.setUpdateBy("admin"); // 在实际应用中应该从安全上下文中获取当前用户
            OrgLevel1 saved = orgLevel1Repository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("一级机构更新成功", saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/org/level1/{id}")
    public ResponseEntity<ApiResponse<String>> deleteOrgLevel1(@PathVariable String id) {
        if (!orgLevel1Repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // 检查是否有下属二级机构
        List<OrgLevel2> childOrgs = orgStructureService.getOrgLevel2ByOrg1Id(id);
        if (!childOrgs.isEmpty()) {
            // 有下属机构，不能删除
            return ResponseEntity.status(409).body(ApiResponse.error("该一级机构下有二级机构，不能删除"));
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
        // 验证机构ID格式
        if (org.getOrg2Id() == null || org.getOrg2Id().length() != 4 || !org.getOrg2Id().matches("\\d{4}")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("二级机构ID必须为4位数字"));
        }
        
        // 验证父级机构ID格式
        if (org.getOrg1Id() == null || org.getOrg1Id().length() != 2 || !org.getOrg1Id().matches("\\d{2}")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("一级机构ID必须为2位数字"));
        }
        
        // 检查一级机构是否存在
        if (!orgStructureService.existsOrgLevel1(org.getOrg1Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("指定的一级机构不存在"));
        }
        
        // 检查机构代码是否已存在
        if (orgLevel2Repository.existsById(org.getOrg2Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("机构代码已存在"));
        }
        
        // 验证ID结构一致性
        if (!org.getOrg2Id().startsWith(org.getOrg1Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("二级机构ID必须以前两位数字与对应的一级机构ID一致"));
        }
        
        org.setCreateTime(LocalDateTime.now());
        org.setUpdateTime(LocalDateTime.now());
        org.setCreateBy("admin"); // 在实际应用中应该从安全上下文中获取当前用户
        org.setUpdateBy("admin");
        OrgLevel2 savedOrg = orgLevel2Repository.save(org);
        return ResponseEntity.ok(ApiResponse.success("二级机构创建成功", savedOrg));
    }
    
    @PutMapping("/org/level2/{id}")
    public ResponseEntity<? extends ApiResponse<? extends Object>> updateOrgLevel2(@PathVariable String id, @RequestBody OrgLevel2 org) {
        return orgLevel2Repository.findById(id).map(existing -> {
            // 检查一级机构是否存在
            if (!org.getOrg1Id().equals(existing.getOrg1Id()) && 
                !orgStructureService.existsOrgLevel1(org.getOrg1Id())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("指定的一级机构不存在"));
            }
            
            existing.setOrg1Id(org.getOrg1Id());
            existing.setOrg2Name(org.getOrg2Name());
            // 更新新增的字段
            existing.setOrgHead(org.getOrgHead());
            existing.setOrgDesc(org.getOrgDesc());
            existing.setEffectiveDate(org.getEffectiveDate());
            existing.setUpdateTime(LocalDateTime.now());
            existing.setUpdateBy("admin"); // 在实际应用中应该从安全上下文中获取当前用户
            OrgLevel2 saved = orgLevel2Repository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("二级机构更新成功", saved));
        }).orElseGet(() -> ResponseEntity.<ApiResponse<OrgLevel2>>notFound().build());
    }
    
    @DeleteMapping("/org/level2/{id}")
    public ResponseEntity<ApiResponse<String>> deleteOrgLevel2(@PathVariable String id) {
        if (!orgLevel2Repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // 检查是否有下属三级机构
        List<OrgLevel3> childOrgs = orgStructureService.getOrgLevel3ByOrg2Id(id);
        if (!childOrgs.isEmpty()) {
            // 有下属机构，不能删除
            return ResponseEntity.status(409).body(ApiResponse.error("该二级机构下有三级机构，不能删除"));
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
        // 验证机构ID格式
        if (org.getOrg3Id() == null || org.getOrg3Id().length() != 6 || !org.getOrg3Id().matches("\\d{6}")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("三级机构ID必须为6位数字"));
        }
        
        // 验证父级机构ID格式
        if (org.getOrg2Id() == null || org.getOrg2Id().length() != 4 || !org.getOrg2Id().matches("\\d{4}")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("二级机构ID必须为4位数字"));
        }
        
        // 检查二级机构是否存在
        if (!orgStructureService.existsOrgLevel2(org.getOrg2Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("指定的二级机构不存在"));
        }
        
        // 检查机构代码是否已存在
        if (orgLevel3Repository.existsById(org.getOrg3Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("机构代码已存在"));
        }
        
        // 验证ID结构一致性
        if (!org.getOrg3Id().startsWith(org.getOrg2Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("三级机构ID必须前四位数字与对应的二级机构ID一致"));
        }
        
        org.setCreateTime(LocalDateTime.now());
        org.setUpdateTime(LocalDateTime.now());
        org.setCreateBy("admin"); // 在实际应用中应该从安全上下文中获取当前用户
        org.setUpdateBy("admin");
        OrgLevel3 savedOrg = orgLevel3Repository.save(org);
        return ResponseEntity.ok(ApiResponse.success("三级机构创建成功", savedOrg));
    }
    
    @PutMapping("/org/level3/{id}")
    public ResponseEntity<? extends ApiResponse<? extends Object>> updateOrgLevel3(@PathVariable String id, @RequestBody OrgLevel3 org) {
        return orgLevel3Repository.findById(id).map(existing -> {
            // 检查二级机构是否存在
            if (!org.getOrg2Id().equals(existing.getOrg2Id()) && 
                !orgStructureService.existsOrgLevel2(org.getOrg2Id())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("指定的二级机构不存在"));
            }
            
            existing.setOrg2Id(org.getOrg2Id());
            existing.setOrg3Name(org.getOrg3Name());
            // 更新新增的字段
            existing.setOrgHead(org.getOrgHead());
            existing.setOrgDesc(org.getOrgDesc());
            existing.setEffectiveDate(org.getEffectiveDate());
            existing.setUpdateTime(LocalDateTime.now());
            existing.setUpdateBy("admin"); // 在实际应用中应该从安全上下文中获取当前用户
            OrgLevel3 saved = orgLevel3Repository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("三级机构更新成功", saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/org/level3/{id}")
    public ResponseEntity<ApiResponse<String>> deleteOrgLevel3(@PathVariable String id) {
        if (!orgLevel3Repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        // 检查是否有员工引用该机构
        // TODO: 实际项目中应检查是否有员工档案引用该机构
        
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
        // 检查职位代码是否已存在
        if (positionRepository.existsById(position.getPositionId())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("职位代码已存在"));
        }
        
        // 检查三级机构是否存在
        if (!orgStructureService.existsOrgLevel3(position.getOrg3Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("指定的三级机构不存在"));
        }
        
        position.setCreateTime(LocalDateTime.now());
        position.setUpdateTime(LocalDateTime.now());
        position.setCreateBy("admin"); // 在实际应用中应该从安全上下文中获取当前用户
        Position savedPosition = positionRepository.save(position);
        return ResponseEntity.ok(ApiResponse.success("职位创建成功", savedPosition));
    }
    
    @PutMapping("/positions/{id}")
    public ResponseEntity<ApiResponse<Position>> updatePosition(@PathVariable String id, @RequestBody Position position) {
        return positionRepository.findById(id).map(existing -> {
            existing.setOrg3Id(position.getOrg3Id());
            existing.setPositionName(position.getPositionName());
            existing.setUpdateTime(LocalDateTime.now());
            existing.setUpdateBy("admin"); // 在实际应用中应该从安全上下文中获取当前用户
            Position saved = positionRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("职位更新成功", saved));
        }).orElseGet(() -> ResponseEntity.<ApiResponse<Position>>notFound().build());
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
    public ResponseEntity<ApiResponse<AppUser>> updateUser(@PathVariable String username, @RequestBody AppUser user) {
        return userRepository.findById(username).map(existing -> {
            existing.setRole(user.getRole());
            existing.setEnabled(user.isEnabled());
            AppUser saved = userRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("用户更新成功", saved));
        }).orElseGet(() -> ResponseEntity.notFound().build());
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
        }).orElseGet(() -> ResponseEntity.notFound().build());
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
        // 检查三级机构是否存在
        if (!orgStructureService.existsOrgLevel3(rule.getOrg3Id())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("指定的三级机构不存在"));
        }
        
        rule.setCreateTime(LocalDateTime.now());
        AttendanceRule savedRule = attendanceRuleRepository.save(rule);
        return ResponseEntity.ok(ApiResponse.success("考勤规则创建成功", savedRule));
    }
    
    @PutMapping("/attendance-rules/{id}")
    public ResponseEntity<ApiResponse<AttendanceRule>> updateAttendanceRule(@PathVariable Long id, @RequestBody AttendanceRule rule) {
        return attendanceRuleRepository.findById(id).map(existing -> {
            existing.setOrg3Id(rule.getOrg3Id());
            existing.setRuleJson(rule.getRuleJson());
            existing.setStatus(rule.getStatus());
            AttendanceRule saved = attendanceRuleRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("考勤规则更新成功", saved));
        }).orElseGet(() -> ResponseEntity.<ApiResponse<AttendanceRule>>notFound().build());
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