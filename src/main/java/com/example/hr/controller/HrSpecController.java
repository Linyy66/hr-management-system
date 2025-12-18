package com.example.hr.controller;

import com.example.hr.model.*;
import com.example.hr.repository.*;
import com.example.hr.service.OrgStructureService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/hr-spec")
public class HrSpecController {
    
    @Autowired
    private StaffArchiveRepository staffArchiveRepository;
    
    @Autowired
    private LeaveApplicationRepository leaveApplicationRepository;
    
    @Autowired
    private OvertimeApplicationRepository overtimeApplicationRepository;
    
    @Autowired
    private OrgLevel1Repository orgLevel1Repository;
    
    @Autowired
    private OrgLevel2Repository orgLevel2Repository;
    
    @Autowired
    private OrgLevel3Repository orgLevel3Repository;
    
    @Autowired
    private PositionRepository positionRepository;
    
    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrgStructureService orgStructureService;
    
    // Helper method to get current user ID
    private String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getName())) {
            return auth.getName();
        }
        return null;
    }
    
    // 员工档案管理
    @GetMapping("/staff")
    public List<StaffArchive> getAllStaffArchives() {
        return staffArchiveRepository.findAll();
    }
    
    @PostMapping("/staff")
    public ResponseEntity<?> createStaffArchive(@RequestBody StaffArchive archive) {
        // 验证必要的组织结构字段是否存在
        if (archive.getOrg3Id() == null || archive.getOrg3Id().isEmpty()) {
            return ResponseEntity.badRequest().body("三级机构ID不能为空");
        }
        
        // 验证账号ID是否存在
        if (archive.getAccountId() == null || archive.getAccountId().isEmpty()) {
            return ResponseEntity.badRequest().body("账号ID不能为空");
        }
        
        // 从org3Id推断org2Id和org1Id
        String org3Id = archive.getOrg3Id();
        if (org3Id.length() >= 6) {
            if (archive.getOrg2Id() == null || archive.getOrg2Id().isEmpty()) {
                archive.setOrg2Id(org3Id.substring(0, 4));
            }
            if (archive.getOrg1Id() == null || archive.getOrg1Id().isEmpty()) {
                archive.setOrg1Id(org3Id.substring(0, 2));
            }
        } else {
            return ResponseEntity.badRequest().body("三级机构ID格式不正确");
        }
        
        // 验证所有组织字段是否都已设置
        if (archive.getOrg1Id() == null || archive.getOrg1Id().isEmpty() ||
            archive.getOrg2Id() == null || archive.getOrg2Id().isEmpty() ||
            archive.getOrg3Id() == null || archive.getOrg3Id().isEmpty()) {
            return ResponseEntity.badRequest().body("组织结构信息不完整");
        }
        
        // 设置其他必要字段
        archive.setStatus("PENDING"); // 默认状态为待审批
        archive.setCreateTime(LocalDateTime.now());
        archive.setUpdateTime(LocalDateTime.now());
        
        try {
            StaffArchive savedArchive = staffArchiveRepository.save(archive);
            return ResponseEntity.ok(savedArchive);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("保存员工档案时发生错误: " + e.getMessage());
        }
    }
    
    @GetMapping("/staff/{id}")
    public ResponseEntity<StaffArchive> getStaffArchive(@PathVariable String id) {
        return staffArchiveRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PutMapping("/staff/{id}")
    public ResponseEntity<StaffArchive> updateStaffArchive(@PathVariable String id, 
                                                        @RequestBody StaffArchive archive) {
        return staffArchiveRepository.findById(id).map(existing -> {
            // 人事专员可以更新所有字段
            existing.setStaffName(archive.getStaffName());
            existing.setGender(archive.getGender());
            existing.setAge(archive.getAge());
            existing.setIdCard(archive.getIdCard());
            existing.setMobile(archive.getMobile());
            existing.setEmail(archive.getEmail());
            existing.setBio(archive.getBio());
            existing.setOrg1Id(archive.getOrg1Id());
            existing.setOrg2Id(archive.getOrg2Id());
            existing.setOrg3Id(archive.getOrg3Id());
            existing.setPositionId(archive.getPositionId());
            existing.setUpdateTime(LocalDateTime.now());
            // 更新后状态重新设为待审批
            existing.setStatus("PENDING");
            return ResponseEntity.ok(staffArchiveRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // 请假初审
    @GetMapping("/leave-applications")
    public List<LeaveApplication> getPendingLeaveApplications() {
        return leaveApplicationRepository.findByApprovalStatus("PENDING");
    }
    
    @PutMapping("/leave-applications/{id}/pre-approve")
    public ResponseEntity<LeaveApplication> preApproveLeaveApplication(@PathVariable Long id) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        
        return leaveApplicationRepository.findById(id).map(application -> {
            // 人事专员只能进行初审，将状态改为待终审
            application.setApprovalStatus("PENDING_FINAL_APPROVAL");
            application.setUpdateTime(LocalDateTime.now());
            // 在实际应用中，应该从安全上下文中获取当前用户作为初审人
            application.setApprover(currentUserId);
            return ResponseEntity.ok(leaveApplicationRepository.save(application));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // 加班初审
    @GetMapping("/overtime-applications")
    public List<OvertimeApplication> getPendingOvertimeApplications() {
        return overtimeApplicationRepository.findByApprovalStatus("PENDING");
    }
    
    @PutMapping("/overtime-applications/{id}/pre-approve")
    public ResponseEntity<OvertimeApplication> preApproveOvertimeApplication(@PathVariable Long id) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        
        return overtimeApplicationRepository.findById(id).map(application -> {
            // 人事专员只能进行初审，将状态改为待终审
            application.setApprovalStatus("PENDING_FINAL_APPROVAL");
            application.setUpdateTime(LocalDateTime.now());
            // 在实际应用中，应该从安全上下文中获取当前用户作为初审人
            application.setApprover(currentUserId);
            return ResponseEntity.ok(overtimeApplicationRepository.save(application));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // 获取所有员工的考勤记录
    @GetMapping("/attendance-records")
    public List<AttendanceRecord> getAllAttendanceRecords() {
        return attendanceRecordRepository.findAll();
    }
    
    // 根据员工ID获取考勤记录
    @GetMapping("/attendance-records/user/{userId}")
    public List<AttendanceRecord> getAttendanceRecordsByUserId(@PathVariable String userId) {
        return attendanceRecordRepository.findByUserId(userId);
    }
    
    // 标记考勤记录为异常
    @PutMapping("/attendance-records/{id}/mark-abnormal")
    public ResponseEntity<AttendanceRecord> markAttendanceAsAbnormal(@PathVariable Long id, 
                                                                   @RequestBody(required = false) String reason) {
        return attendanceRecordRepository.findById(id).map(record -> {
            record.setAbnormal(true);
            record.setAbnormalReason(reason != null ? reason : "考勤异常");
            return ResponseEntity.ok(attendanceRecordRepository.save(record));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // 标记考勤记录为正常
    @PutMapping("/attendance-records/{id}/mark-normal")
    public ResponseEntity<AttendanceRecord> markAttendanceAsNormal(@PathVariable Long id) {
        return attendanceRecordRepository.findById(id).map(record -> {
            record.setAbnormal(false);
            record.setAbnormalReason(null);
            return ResponseEntity.ok(attendanceRecordRepository.save(record));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // 获取所有员工用户
    @GetMapping("/users")
    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }
    
    // 根据用户名获取特定用户信息
    @GetMapping("/users/{username}")
    public ResponseEntity<AppUser> getUserByUsername(@PathVariable String username) {
        return userRepository.findById(username)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    // 组织架构查看（用于员工建档时选择）
    @GetMapping("/org/level1")
    public List<OrgLevel1> getAllOrgLevel1() {
        return orgStructureService.getAllOrgLevel1();
    }
    
    @GetMapping("/org/level2")
    public List<OrgLevel2> getAllOrgLevel2() {
        return orgStructureService.getAllOrgLevel2();
    }
    
    @GetMapping("/org/level2/by-org1/{org1Id}")
    public List<OrgLevel2> getOrgLevel2ByOrg1Id(@PathVariable String org1Id) {
        return orgStructureService.getOrgLevel2ByOrg1Id(org1Id);
    }
    
    @GetMapping("/org/level3")
    public List<OrgLevel3> getAllOrgLevel3() {
        return orgStructureService.getAllOrgLevel3();
    }
    
    @GetMapping("/org/level3/by-org2/{org2Id}")
    public List<OrgLevel3> getOrgLevel3ByOrg2Id(@PathVariable String org2Id) {
        return orgStructureService.getOrgLevel3ByOrg2Id(org2Id);
    }
    
    // 职位查看（用于员工建档时选择）
    @GetMapping("/positions")
    public List<Position> getAllPositions() {
        return positionRepository.findAll();
    }
    
    // 根据三级机构获取职位
    @GetMapping("/positions/by-org3/{org3Id}")
    public List<Position> getPositionsByOrg3(@PathVariable String org3Id) {
        return positionRepository.findByOrg3Id(org3Id);
    }
    
    // 获取今日入职员工数量
    @GetMapping("/new-hires/today/count")
    public Long getTodayNewHiresCount() {
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime todayEnd = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        
        return staffArchiveRepository.countByCreateTimeBetweenAndStatus(todayStart, todayEnd, "NORMAL");
    }

    
    // 获取本周离职员工数量
    @GetMapping("/resignations/week/count")
    public Long getWeekResignationCount() {
        LocalDateTime weekStart = LocalDateTime.now().minusDays(7).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime weekEnd = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        
        return staffArchiveRepository.countByCreateTimeBetweenAndStatus(weekStart, weekEnd, "RESIGNED");
    }
    
    // 获取考勤异常数量
    @GetMapping("/attendance-exceptions/count")
    public Long getAttendanceExceptionsCount() {
        return attendanceRecordRepository.countByAbnormal(true);
    }

}