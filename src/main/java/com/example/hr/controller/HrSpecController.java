package com.example.hr.controller;

import com.example.hr.model.*;
import com.example.hr.repository.*;
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
    public StaffArchive createStaffArchive(@RequestBody StaffArchive archive) {
        archive.setStatus("PENDING");
        archive.setCreateTime(LocalDateTime.now());
        archive.setUpdateTime(LocalDateTime.now());
        return staffArchiveRepository.save(archive);
    }
    
    @GetMapping("/staff/{id}")
    public ResponseEntity<StaffArchive> getStaffArchive(@PathVariable String id) {
        return staffArchiveRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/staff/{id}")
    public ResponseEntity<StaffArchive> updateStaffArchive(@PathVariable String id, 
                                                        @RequestBody StaffArchive archive) {
        return staffArchiveRepository.findById(id).map(existing -> {
            // 人事专员只能更新部分字段
            existing.setStaffName(archive.getStaffName());
            existing.setPhone(archive.getPhone());
            existing.setMobile(archive.getMobile());
            existing.setEmail(archive.getEmail());
            existing.setUpdateTime(LocalDateTime.now());
            // 更新后状态重新设为待审批
            existing.setStatus("PENDING");
            return ResponseEntity.ok(staffArchiveRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // 请假初审
    @GetMapping("/leave-applications")
    public List<LeaveApplication> getPendingLeaveApplications() {
        return leaveApplicationRepository.findByStatus("PENDING");
    }
    
    @PutMapping("/leave-applications/{id}/pre-approve")
    public ResponseEntity<LeaveApplication> preApproveLeaveApplication(@PathVariable Long id) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        
        return leaveApplicationRepository.findById(id).map(application -> {
            // 人事专员只能进行初审，将状态改为待终审
            application.setStatus("PENDING_FINAL_APPROVAL");
            application.setUpdateTime(LocalDateTime.now());
            // 在实际应用中，应该从安全上下文中获取当前用户作为初审人
            application.setApproverId(currentUserId);
            return ResponseEntity.ok(leaveApplicationRepository.save(application));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // 加班初审
    @GetMapping("/overtime-applications")
    public List<OvertimeApplication> getPendingOvertimeApplications() {
        return overtimeApplicationRepository.findByStatus("PENDING");
    }
    
    @PutMapping("/overtime-applications/{id}/pre-approve")
    public ResponseEntity<OvertimeApplication> preApproveOvertimeApplication(@PathVariable Long id) {
        String currentUserId = getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(401).build();
        }
        
        return overtimeApplicationRepository.findById(id).map(application -> {
            // 人事专员只能进行初审，将状态改为待终审
            application.setStatus("PENDING_FINAL_APPROVAL");
            application.setUpdateTime(LocalDateTime.now());
            // 在实际应用中，应该从安全上下文中获取当前用户作为初审人
            application.setApproverId(currentUserId);
            return ResponseEntity.ok(overtimeApplicationRepository.save(application));
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // 组织架构查看（用于员工建档时选择）
    @GetMapping("/org/level1")
    public List<OrgLevel1> getAllOrgLevel1() {
        return orgLevel1Repository.findAll();
    }
    
    @GetMapping("/org/level2")
    public List<OrgLevel2> getAllOrgLevel2() {
        return orgLevel2Repository.findAll();
    }
    
    @GetMapping("/org/level3")
    public List<OrgLevel3> getAllOrgLevel3() {
        return orgLevel3Repository.findAll();
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
}